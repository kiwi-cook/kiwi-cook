from dotenv import load_dotenv
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from mongodb import get_database

load_dotenv()

app = FastAPI(title="Taste Buddy",
              description="The Student-Friendly Recipe Suggestion App: Crafted by Students, for Students",
              version="0.2.0",
              redoc_url=None, debug=False)
origins = [
    "http://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def start_server():
    print("Starting server...")
    app.run(port=8000, debug=True)


client = get_database()


@app.get("/")
def read_root():
    return "Hello from Taste Buddy!"
