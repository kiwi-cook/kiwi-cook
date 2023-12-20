from typing import Annotated, Any
from bson.objectid import ObjectId as _ObjectId
from pydantic import (AfterValidator, GetPydanticSchema,
                      PlainSerializer, WithJsonSchema)

PyObjectId = Annotated[
    _ObjectId,
    AfterValidator(lambda id: PyObjectId(id)),
    PlainSerializer(lambda id: str(id), return_type=str, when_used='json-unless-none'),
    WithJsonSchema({'type': 'string'}, mode='serialization'),
    WithJsonSchema({'type': 'string'}, mode='validation'),
    GetPydanticSchema(lambda _s, h: h(Any))
]
