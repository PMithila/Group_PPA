# utils.py
import os
from pathlib import Path
from typing import List, Dict
import pandas as pd
from datetime import datetime, timedelta

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "./data/uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def save_upload_file(uploaded_file) -> str:
    # uploaded_file is starlette UploadFile
    fname = uploaded_file.filename
    dest = UPLOAD_DIR / fname
    n = 1
    # avoid overwrite
    while dest.exists():
        dest = UPLOAD_DIR / f"{dest.stem}-{n}{dest.suffix}"
        n += 1
    with open(dest, "wb") as fd:
        fd.write(uploaded_file.file.read())
    return str(dest)

def load_csv_as_df(path: str) -> pd.DataFrame:
    return pd.read_csv(path)
