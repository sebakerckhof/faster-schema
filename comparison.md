# Comparison with Simple-Schema and Superstruct

## Performance comparison
| Action                         | Faster-Schema                  | Simple-Schema                 | Superstruct                    |
|-----------------------------------|--------------------------------|-------------------------------|--------------------------------|
| Cleaning performance advanced example   | ~60ms | ~2000ms | /     |
| Validation performance advanced example | ~50ms | ~900ms  | ~30ms |

## Feature comparison
| Feature                           | Faster-Schema                  | Simple-Schema                 | Superstruct                    |
|-----------------------------------|--------------------------------|-------------------------------|--------------------------------|
| Shorthands                        | Yes (also for optional fields) | Yes (not for optional fields) | Yes (also for optional fields) |
| Nested Schemas Schema composition | Yes                            | Yes                           | Yes                            |
| Schema merging                    | Yes                            | Yes                           | Yes                            |
| Schema extraction                 | Yes                            | Yes                           | No                             |
| Schema extending                  | Yes                            | Yes                           | No                             |
| Custom types                      | Yes                            | No                            | Yes                            |
| Custom validators                 | Yes                            | Yes                           | Yes (by using a custom type)   |
| Meaningful Error Messages         | Yes                            | Yes                           | Yes                            |
| Customizable error messages       | Yes                            | Yes                           | No                             |
| Support for check-audit-arguments | Yes                            | Yes                           | No                             |
| Support for mongoDB modifiers     | No                             | Yes                           | No                             |
| Tracker integration               | No                             | Yes                           | No                             |
| Asynchronous Validation           | No                             | Yes                           | No                             |
| Data cleaning                     | Yes (advanced)                 | Yes (advanced)                | Yes (very basic)               |
| Built in: min/max minCount/maxCount     | Yes   | Yes     | No    |
| Multi definition fields                 | No    | Yes     | No    |

Adding support of MongoDB modifiers would add a lot of complexity and therefore make the validation/cleaning slower. Therefore it is a non-goal for this package.


## API differences with Simple-Schema

### Simple-Schema v1
Our API is based of `Simple-Schema` v2. So all changes here: https://github.com/aldeed/meteor-simple-schema/blob/master/CHANGELOG.md#200 , also apply if you go to `Faster-Schema`

### AutoValue & Custom validators
`Simple-Schema` gives the autoValue and custom validators a `this` context containing related to the field being validated.
`Faster-Schema` instead passes a similar object as the first argument.
The features are mapped like:
```
isSet -> isSet
value -> value
getField(field).value -> getValue(field)
getSiblingField(field).value -> getSiblingValue(field)
```

Note that the `getField` and `getSiblingField` passes the field in the current state. So it depends on the order of the definitions in the schema whether that field is already cleaned or not.
`Faster-Schema` will give you the cleaned value, no matter what the order of the fields in the schema is.

# Asynchronous validation

The problem with asynchronous validation in simple schema, is that the validator might say the object is valid while it is still being validated and might in fact not be valid. If faster schema is going to support asynchronous validation it would be to make the validator return a promise that only shows the result after validation is done. But currently there is no such support.
