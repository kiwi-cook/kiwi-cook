import os

import certifi
from pymongo import MongoClient
from pymongo.server_api import ServerApi


def get_database():
    url = ('mongodb+srv://tastebuddyprod.xsyiamo.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509'
           '&retryWrites=true&w=majority')
    client = MongoClient(url,
                         tls=True,
                         tlsCertificateKeyFile='mongo-cert.pem',
                         server_api=ServerApi('1'),
                         tlsCAFile=certifi.where())
    return client['tastebuddy']
