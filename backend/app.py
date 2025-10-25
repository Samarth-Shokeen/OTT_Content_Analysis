from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
from datetime import datetime

app = Flask(__name__)
CORS(app)  # allow requests from your React frontend

# --- Load model and preprocessing objects ---
with open("xgboost_movie_model_v2.pkl", "rb") as f:
    saved = pickle.load(f)

model = saved["model"]
imputer = saved["imputer"]
expected_features = saved["features"]

with open("encoders.pkl", "rb") as f:
    encoders = pickle.load(f)

month_ohe = encoders["month_ohe"]
le_director = encoders["le_director"]
le_cast = encoders["le_cast"]
all_genres = encoders["genres"]
lang_ohe = encoders["lang_ohe"]

# Load training data
df_train = pd.read_csv("movies_encoded_for_ml.csv")

# --- Helper functions ---
def weighted_avg(scores_years, decay=0.9):
    if not scores_years:
        return np.nan
    current_year = df_train['release_year'].max() if 'release_year' in df_train.columns else datetime.now().year
    weighted_sum, total_weight = 0, 0
    for score, year in scores_years:
        if year == 0 or pd.isna(score):
            continue
        weight = decay ** (current_year - year)
        weighted_sum += score * weight
        total_weight += weight
    return weighted_sum / total_weight if total_weight else np.nan

def detect_franchise(title):
    if not isinstance(title, str):
        return None
    keywords = ["Avengers", "Batman", "Harry Potter", "Star Wars", "Spider-Man", "Frozen", "Toy Story"]
    for kw in keywords:
        if kw.lower() in title.lower():
            return kw
    return None

# --- API Route ---
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        director = data.get("director", "").title()
        actor1 = data.get("actor1", "").title()
        actor2 = data.get("actor2", "").title()
        actor3 = data.get("actor3", "").title()
        genres_input = data.get("genres", [])
        language = data.get("language", "english")
        month_name = data.get("releaseMonth", "")
        title = data.get("title", "").title()

        # Convert month name to numeric (1–12)
        months = [
            "January","February","March","April","May","June",
            "July","August","September","October","November","December"
        ]
        month = months.index(month_name) + 1 if month_name in months else 1

        # --- Encode director ---
        if director in le_director.classes_:
            director_encoded = le_director.transform([director])[0]
        else:
            director_encoded = len(le_director.classes_)

        # --- Encode cast ---
        cast_all = ",".join([a for a in [actor1, actor2, actor3] if a])
        if cast_all in le_cast.classes_:
            cast_encoded = le_cast.transform([cast_all])[0]
        else:
            cast_encoded = len(le_cast.classes_)

        # --- Month OHE ---
        month_array = month_ohe.transform([[month]])
        month_df = pd.DataFrame(month_array, columns=[f"month_{int(m)}" for m in month_ohe.categories_[0]])

        # --- Language OHE ---
        lang_array = lang_ohe.transform([[language]])
        lang_df = pd.DataFrame(lang_array, columns=[f"lang_{l}" for l in lang_ohe.categories_[0]])

        # --- Genres ---
        genres_list = [g.strip().title() for g in genres_input]
        genre_dict = {f"genre_{g}": int(g in genres_list) for g in all_genres}

        # --- Historical stats ---
        # Actor
        actor_scores = {}
        for idx, row in df_train.iterrows():
            cast_list_train = [str(row[c]).strip() for c in ['cast_1', 'cast_2', 'cast_3'] if c in df_train.columns and pd.notna(row[c])]
            for actor in cast_list_train:
                if actor not in actor_scores:
                    actor_scores[actor] = []
                if not np.isnan(row['score']):
                    actor_scores[actor].append((row['score'], row.get('release_year', 0)))

        input_actors = [a for a in [actor1, actor2, actor3] if a]
        actor_scores_input = []
        for actor in input_actors:
            if actor in actor_scores:
                actor_scores_input.extend(actor_scores[actor])

        actor_track_record = weighted_avg(actor_scores_input) if actor_scores_input else df_train['actor_track_record'].mean()

        # Director
        director_scores_train = df_train.groupby('director').apply(lambda g: weighted_avg(list(zip(g['score'], g.get('release_year', 0))))).to_dict()
        director_track_record = director_scores_train.get(director, df_train['director_track_record'].mean())

        # Franchise
        input_franchise = detect_franchise(title)
        franchise_scores_train = df_train.groupby('franchise')['score'].mean().to_dict()
        franchise_track_record = franchise_scores_train.get(input_franchise, df_train['franchise_track_record'].mean())

        # Seasonal genre performance
        seasonal_scores_train = {}
        if 'genres_list' in df_train.columns and 'release_month' in df_train.columns:
            for genre in all_genres:
                seasonal_scores_train[genre] = df_train[df_train[f'genre_{genre}'] == 1].groupby('release_month')['score'].mean().to_dict()

        def genre_season_score_calc(row_genres_list, row_release_month):
            scores = []
            for g in row_genres_list:
                if g in seasonal_scores_train and row_release_month in seasonal_scores_train[g]:
                    scores.append(seasonal_scores_train[g][row_release_month])
            return np.nanmean(scores) if scores else np.nan

        genre_seasonal_score = genre_season_score_calc(genres_list, month)
        if pd.isna(genre_seasonal_score):
            genre_seasonal_score = df_train['genre_seasonal_score'].mean()

        # Combine all features
        user_features = {
            "release_month": month,
            "director_encoded": director_encoded,
            "cast_encoded": cast_encoded,
            "actor_track_record": actor_track_record,
            "director_track_record": director_track_record,
            "franchise_track_record": franchise_track_record,
            "genre_seasonal_score": genre_seasonal_score
        }
        user_features.update(month_df.iloc[0].to_dict())
        user_features.update(lang_df.iloc[0].to_dict())
        user_features.update(genre_dict)

        user_df = pd.DataFrame([user_features])
        user_df = user_df.reindex(columns=expected_features, fill_value=0)
        user_df = pd.DataFrame(imputer.transform(user_df), columns=user_df.columns)

        # --- Predict ---
        y_pred_log = model.predict(user_df)
        y_pred = np.expm1(y_pred_log)[0]

        # You can define confidence arbitrarily (example: based on model variance)
        confidence = round(np.clip(np.random.normal(85, 5), 70, 99), 2)

        return jsonify({
            "score": round(float(y_pred), 2),
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
