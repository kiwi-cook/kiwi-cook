from typing import Optional

from pydantic import Field, BaseModel


class LocalizedString(BaseModel):
    __langs = ["de", "en", "es", "fr", "it"]

    de: Optional[str] = Field(alias="de", default=None)
    en: Optional[str] = Field(alias="en", default=None)
    es: Optional[str] = Field(alias="es", default=None)
    fr: Optional[str] = Field(alias="fr", default=None)
    it: Optional[str] = Field(alias="it", default=None)

    def get_langs(self):
        return [
            lang for lang in self.__langs if self.__getattribute__(lang) is not None
        ]

    @staticmethod
    def new(lang: str, value: str):
        print(f"Creating localized string with lang: {lang} and value: {value}")
        return LocalizedString(**{lang: value})

    def __getitem__(self, key):
        return getattr(self, key)
