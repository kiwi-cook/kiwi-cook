from typing import Optional, List

from pydantic import Field, BaseModel


class LocalizedString(BaseModel):
    de: Optional[str] = Field(alias="de", default=None)
    en: Optional[str] = Field(alias="en", default=None)
    es: Optional[str] = Field(alias="es", default=None)
    fr: Optional[str] = Field(alias="fr", default=None)
    it: Optional[str] = Field(alias="it", default=None)
