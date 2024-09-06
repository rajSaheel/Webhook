from marshmallow import Schema, fields, post_load, validate

class ActionSchema(Schema):
    request_id = fields.Str(required=True)
    author = fields.Str(required=True)
    action = fields.Str(required=True,validate=validate.OneOf(['PUSH','PULL_REQUEST','MERGE']))
    from_branch = fields.Str()
    to_branch = fields.Str()
    timestamp = fields.Str(required = True)