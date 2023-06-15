from flask import Flask, jsonify
from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session


app = Flask(__name__)


@app.route("/")
def home():
    return "Home Page"


if __name__ == "__main__":
    app.run(debug=True)
