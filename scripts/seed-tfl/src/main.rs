use serde::Deserialize;
use sqlx::postgres::PgPoolOptions;
use std::collections::HashMap;

const TFL_API_URL: &str = "https://api.tfl.gov.uk/Place/Type/JamCam";

#[derive(Debug, Deserialize)]
struct AdditionalProperty {
    key: String,
    value: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TflPlace {
    id: String,
    common_name: String,
    lat: f64,
    lon: f64,
    #[serde(default)]
    additional_properties: Vec<AdditionalProperty>,
}

struct Camera {
    tfl_id: String,
    common_name: String,
    available: bool,
    image_url: String,
    video_url: String,
    view: String,
    lat: f64,
    lng: f64,
}

impl From<TflPlace> for Camera {
    fn from(place: TflPlace) -> Self {
        let props: HashMap<String, String> = place
            .additional_properties
            .into_iter()
            .map(|p| (p.key, p.value))
            .collect();

        Camera {
            tfl_id: place.id,
            common_name: place.common_name,
            available: props.get("available").map(|v| v == "true").unwrap_or(false),
            image_url: props.get("imageUrl").cloned().unwrap_or_default(),
            video_url: props.get("videoUrl").cloned().unwrap_or_default(),
            view: props.get("view").cloned().unwrap_or_default(),
            lat: place.lat,
            lng: place.lon,
        }
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load .env if present (ignored in production where env vars are set directly)
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    println!("Fetching cameras from TfL API...");
    let places: Vec<TflPlace> = reqwest::get(TFL_API_URL)
        .await?
        .error_for_status()?
        .json()
        .await?;

    println!("Fetched {} cameras", places.len());

    let cameras: Vec<Camera> = places.into_iter().map(Camera::from).collect();

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    // Ensure the labs schema exists
    sqlx::query("CREATE SCHEMA IF NOT EXISTS labs")
        .execute(&pool)
        .await?;

    // Ensure the table exists
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS labs.tfl_cameras (
            id          SERIAL PRIMARY KEY,
            tfl_id      TEXT NOT NULL UNIQUE,
            common_name TEXT NOT NULL,
            available   INTEGER,
            image_url   TEXT,
            video_url   TEXT,
            view        TEXT,
            lat         TEXT NOT NULL,
            lng         TEXT NOT NULL,
            created_at  TIMESTAMPTZ DEFAULT NOW(),
            updated_at  TIMESTAMPTZ DEFAULT NOW()
        )
        "#,
    )
    .execute(&pool)
    .await?;

    for cam in &cameras {
        sqlx::query(
            r#"
            INSERT INTO labs.tfl_cameras
                (tfl_id, common_name, available, image_url, video_url, view, lat, lng, updated_at)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (tfl_id) DO UPDATE SET
                common_name = EXCLUDED.common_name,
                available   = EXCLUDED.available,
                image_url   = EXCLUDED.image_url,
                video_url   = EXCLUDED.video_url,
                view        = EXCLUDED.view,
                lat         = EXCLUDED.lat,
                lng         = EXCLUDED.lng,
                updated_at  = NOW()
            "#,
        )
        .bind(&cam.tfl_id)
        .bind(&cam.common_name)
        .bind(cam.available as i32)
        .bind(&cam.image_url)
        .bind(&cam.video_url)
        .bind(&cam.view)
        .bind(cam.lat.to_string())
        .bind(cam.lng.to_string())
        .execute(&pool)
        .await?;
    }

    println!("Done: upserted {} cameras", cameras.len());

    Ok(())
}
