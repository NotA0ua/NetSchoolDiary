from dotenv import load_dotenv
from os import getenv


def get_env_variable(name: str) -> str:
    variable = getenv(name)
    if not variable:
        raise ValueError(f"{name} is not provided in .env")
    return variable


load_dotenv()

URL = "https://giseo.rkomi.ru/"

LOGIN = get_env_variable("LOGIN")
PASSWORD = get_env_variable("PASSWORD")
SCHOOL_NAME_OR_ID = get_env_variable("SCHOOL_NAME_OR_ID")
