<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Comparison with Simple-Schema and Superstruct](#comparison-with-simple-schema-and-superstruct)
  - [Performance comparison](#performance-comparison)
  - [Feature comparison](#feature-comparison)
  - [API differences with Simple-Schema](#api-differences-with-simple-schema)
    - [Simple-Schema v1](#simple-schema-v1)
    - [Custom data types](#custom-data-types)
    - [Custom field definitions](#custom-field-definitions)
    - [AutoValue functions](#autovalue-functions)
    - [Custom validators](#custom-validators)
    - [Schema merging](#schema-merging)
    - [Schema extacting](#schema-extacting)
    - [Custom error messages](#custom-error-messages)
    - [Asynchronous validation](#asynchronous-validation)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Comparison with Simple-Schema and Superstruct

## Performance comparison
| Action                         | Faster-Schema                  | Simple-Schema                 | Superstruct                    |
|-----------------------------------|--------------------------------|-------------------------------|--------------------------------|
| Cleaning performance advanced example   | ~20ms | ~1600ms | /     |
| Validation performance advanced example | ~30ms | ~700ms  | ~17ms |

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

Adding `Tracker` integration was not a goal for this project, but it shouldn't be too hard to add it.
However, see the note about asynchronous validation below.

## API differences with Simple-Schema

### Simple-Schema v1
Our API is based of `Simple-Schema` v2. So all changes here: https://github.com/aldeed/meteor-simple-schema/blob/master/CHANGELOG.md#200 , also apply if you go to `Faster-Schema`

But there are some further differences:

### Custom data types
Similar to `Simple-Schema`, it is allowed to pass in a custom constructor as data type.
However, you will also need to specify the `blackbox` option if you don't want `Faster-Schema` to check the inner properties of the object.

Example:
```js
// Simple-Schema
foo: {
  type: MyDataType
}

// Faster-Schema
foo: {
  type: MyDataType,
  blackbox: true
}
```

### Custom field definitions
`Simple-Schema` validates all fields in a definition. `Faster-Schema` does not do this.
Therefore if you want to include custom fields in your definition, you do not need to register these with `extendOptions` like you would with `Simple-Schema`

### AutoValue functions
`Simple-Schema` gives the autoValue functions a `this` context containing information related to the field being validated.
`Faster-Schema` instead passes a similar object as the first argument.
The features are mapped like:
```
isSet -> isSet
value -> value
getField(field).value -> getValue(field)
getSiblingField(field).value -> getSiblingValue(field)
```

Note that the `getField` and `getSiblingField` in `Simple-Schema` passes the field in the current state.
So this field may or may not be cleaned already depending on the order of fields in the schema.
`Faster-Schema` will give you always the cleaned value, no matter what the order of the fields in the schema is.

Example:
```js
// Simple-Schema
custom (){
  if (this.value !== this.getSiblingField('otherfield').value) {
    return 'shouldBeSame';
  }
}

// Faster-Schema
custom ({value, getSiblingValue}){
  if (value !== getSiblingValue('otherfield')) {
    return 'shouldBeSame';
  }
}
```

### Custom validators
`Simple-Schema` gives the custom validators a `this` context containing related to the field being validated.
`Faster-Schema` instead passes a similar object as the first argument.
The features are mapped like:
```
isSet -> isSet
value -> value
getField(field).value -> rootObj
getSiblingField(field).value -> parentObj
```

So you don't have the `getField` and `getSiblingField` helpers, but you can get the value directly from the root or parent object that is passed.

Example:
```js
// Simple-Schema
custom (){
  if (this.value !== this.getSiblingField('otherfield').value) {
    return 'shouldBeSame';
  }
}

// Faster-Schema
custom ({value, parentObj}){
  if (value !== parentObj.otherfield) {
    return 'shouldBeSame';
  }
}
```

**note** that `Simple-Schema` will call custom validators on fields that are not defined. `Faster-Schema`

### Schema merging
`Simple-Schema` v2 gives you no easy way to create a new schema by merging existing schemas together.
`Simple-Schema` v1 allows you to do this by passing an array to the constructor.
`Faster-Schema` instead gives you the static `FasterSchema.merge` method, this accepts a list of schemas, but not an array.

E.g.
```js
// Simple-Schema v1
new SimpleSchema([schema1, schema2, {...}]);

// Faster-Schema
FasterSchema.mege(schema1, schema2, {...});
```
### Schema extacting
The `pick` and `omit` methods accept a comma seperated list of values to pick or omit, but not an array.
E.g.
```js
// Simple-Schema
schema.pick(['field','field2']);

// Faster-Schema
schema.pick(['field','field2']);
```

Another difference is that it will automatically pick ancestor fields, but not automatically pick sub fields.
For getting all children, you can use the wildcard notation.
E.g.
```js
// Simple-Schema
schema.pick(['field','field.subfield','array']);

// Faster-Schema
schema.pick(['field.subfield','array.*']);
```

### Custom error messages
`Simple-Schema` uses `messagebox` to handle the error message templates. `Faster-Schema` uses normal ES6 string templates.
So to change the error messages.

So you can change the error messages like:

```js
// Simple-Schema
Simplechema.setDefaultMessages({
  messages: {
    en: {
      dateInFuture: '[label] should be in the future',
      dateStartBeforeEnd: 'The end date should be at least 10 minutes after the start date.'
    },
  },
});

// Faster-Schema
FasterSchema.setDefaultMessages({
  messages: {
    en: {
      dateInFuture({label}) { return `${label} should be in the future`; },
      dateStartBeforeEnd() { return 'The end date should be at least 10 minutes after the start date.'; }
    },
  },
});
```
You get an object containing the normalized field definition and field value.

Currently error messages can only be changed globally, and not per-schema as you can do in `Simple-Schema`.

### Asynchronous validation

The problem with asynchronous validation in simple schema, is that the validator might say the object is valid while it is still being validated and might in fact not be valid. If faster schema is going to support asynchronous validation it would be to make the validator return a promise that only shows the result after validation is done. But currently there is no such support.
