[![CircleCI](https://circleci.com/gh/aldeed/simple-schema-js/tree/master.svg?style=svg)](https://circleci.com/gh/aldeed/simple-schema-js/tree/master)

# FasterSchema (faster-schema NPM package)

FasterSchema validates JavaScript objects to ensure they match a schema. It can also clean the objects to automatically convert types, remove unsupported properties, and add automatic values such that the object is then more likely to pass validation.
Note that this package is very new and the API might change.

This package is mainly meant as a limited, but faster alternative to [SimpleSchema](https://github.com/aldeed/simple-schema-js/), with a very similar API. [Here's a complete comparison](comparison.md).
In short: the main difference is that this package doesn't support validating against mongoDB modifiers. But in our [tests](https://github.com/sebakerckhof/schema-comparison) on an advanced schema with a large object, it is about ~20x faster for validation and ~50x faster for cleaning of data.

There are a lot of similar packages for validating objects. These are some of the features of this package that might be good reasons to choose this one over another:
- Isomorphic. Works in NodeJS and modern (evergreen) browsers.
- Powerful customizable error message system with decent English language defaults and support for localization, which makes it easy to drop this package in and display the validation error messages to end users.
- Has hundreds of tests

For an even faster (about 2x faster) schema validator, have a look at the excellent [superstruct](https://github.com/ianstormtaylor/superstruct) package. However superstruct is less flexible in terms of data cleaning and schema composition. In the future we might also adapt the same compiler methodology as superstruct and get as fast, but it is not on the short term roadmap.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Installation](#installation)
- [Lingo](#lingo)
- [Quick Start](#quick-start)
  - [Validate an Object and Throw an Error](#validate-an-object-and-throw-an-error)
  - [Validate an Array of Objects and Throw an Error](#validate-an-array-of-objects-and-throw-an-error)
  - [Validate a Meteor Method Argument and Satisfy `audit-argument-checks`](#validate-a-meteor-method-argument-and-satisfy-audit-argument-checks)
  - [Validate an Object and Get the Errors](#validate-an-object-and-get-the-errors)
  - [Automatically Clean the Object Before Validating It](#automatically-clean-the-object-before-validating-it)
  - [Set Default Cleaning Options](#set-default-cleaning-options)
  - [Explicitly Clean an Object](#explicitly-clean-an-object)
- [Defining a Schema](#defining-a-schema)
  - [Shorthand Definitions](#shorthand-definitions)
  - [Longhand Definitions](#longhand-definitions)
  - [Mixing Shorthand with Longhand](#mixing-shorthand-with-longhand)
  - [More Shorthand](#more-shorthand)
  - [Extending Schemas](#extending-schemas)
    - [Overriding When Extending](#overriding-when-extending)
  - [Merging schemas](#merging-schemas)
  - [Subschemas / Schema composition](#subschemas--schema-composition)
  - [Extracting Schemas](#extracting-schemas)
- [Schema Keys](#schema-keys)
- [Schema Rules](#schema-rules)
  - [type](#type)
  - [label](#label)
  - [optional](#optional)
  - [required](#required)
  - [min/max](#minmax)
  - [exclusiveMin/exclusiveMax](#exclusiveminexclusivemax)
  - [minCount/maxCount](#mincountmaxcount)
  - [allowedValues](#allowedvalues)
  - [regEx](#regex)
  - [blackbox](#blackbox)
  - [trim](#trim)
  - [custom](#custom)
  - [defaultValue](#defaultvalue)
  - [autoValue](#autovalue)
  - [Getting field properties](#getting-field-properties)
- [Validating Data](#validating-data)
  - [Ways to Perform Validation](#ways-to-perform-validation)
    - [Named Validation Contexts](#named-validation-contexts)
    - [Unnamed Validation Contexts](#unnamed-validation-contexts)
  - [Validating an Object](#validating-an-object)
  - [Validating Only Some Keys in an Object](#validating-only-some-keys-in-an-object)
  - [Validation Options](#validation-options)
  - [Validating and Throwing ValidationErrors](#validating-and-throwing-validationerrors)
    - [Customize the Error That is Thrown](#customize-the-error-that-is-thrown)
  - [Custom Field Validation](#custom-field-validation)
  - [Custom Whole-Document Validators](#custom-whole-document-validators)
  - [Manually Adding a Validation Error](#manually-adding-a-validation-error)
  - [Getting a List of Invalid Keys and Validation Error Messages](#getting-a-list-of-invalid-keys-and-validation-error-messages)
- [Customizing Validation Messages](#customizing-validation-messages)
- [Other Validation Context Methods](#other-validation-context-methods)
- [Other FasterSchema Methods](#other-fasterschema-methods)
- [Cleaning Objects](#cleaning-objects)
- [Dates](#dates)
- [Best Practice Code Examples](#best-practice-code-examples)
  - [Make a field conditionally required](#make-a-field-conditionally-required)
  - [Validate one key against another](#validate-one-key-against-another)
- [License](#license)
- [Contributing](#contributing)
  - [Thanks](#thanks)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
npm install faster-schema
```

NOTE: You may also need to load the `babel-polyfill` package if you get any errors related to missing ES6 functions in certain browsers.

## Lingo

In this documentation:
- "key", "field", and "property" generally all mean the same thing: an identifier for some part of an object that is validated by your schema. FasterSchema uses dot notation to identify nested keys.
- "validate" means to check whether an object matches what you expect, for example, having the expected keys with the expected data types, expected string lengths, etc.

## Quick Start

### Validate an Object and Throw an Error

```js
import FasterSchema from 'faster-schema';

new FasterSchema({
  name: String,
}).validate({
  name: 2,
});
```

### Validate an Array of Objects and Throw an Error

An error is thrown for the first invalid object found.

```js
import FasterSchema from 'faster-schema';

new FasterSchema({
  name: String,
}).validate([
  { name: 'Bill' },
  { name: 2 },
]);
```

### Validate a Meteor Method Argument and Satisfy `audit-argument-checks`

To avoid errors about not checking all arguments when you are using FasterSchema to validate Meteor method arguments, you must pass `check` as an option when creating your FasterSchema instance.

```js
import FasterSchema from 'faster-schema';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

FasterSchema.defineValidationErrorTransform(error => {
  const ddpError = new Meteor.Error(error.message);
  ddpError.error = 'validation-error';
  ddpError.details = error.details;
  return ddpError;
});

const myMethodObjArgSchema = new FasterSchema({ name: String }, { check });

Meteor.methods({
  myMethod(obj) {
    myMethodObjArgSchema.validate(obj);

    // Now do other method stuff knowing that obj satisfies the schema
  },
});
```

### Validate an Object and Get the Errors

```js
import FasterSchema from 'faster-schema';

const validationContext = new FasterSchema({
  name: String,
}).newContext();

validationContext.validate({
  name: 2,
});

console.log(validationContext.isValid());
console.log(validationContext.validationErrors());
```

### Automatically Clean the Object Before Validating It

TO DO

### Set Default Cleaning Options

```js
import FasterSchema from 'faster-schema';

const mySchema = new FasterSchema({
  name: String,
}, {
  clean: {
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: true,
    getAutoValues: true,
    removeNullsFromArrays: true,
  },
});
```

### Explicitly Clean an Object

```js
import FasterSchema from 'faster-schema';

const mySchema = new FasterSchema({ name: String });
const doc = { name: 123 };
const cleanDoc = mySchema.clean(doc);
// cleanDoc is now mutated to hopefully have a better chance of passing validation
console.log(typeof cleanDoc.name); // string
```
## Defining a Schema

Let's get into some more details about the different syntaxes that are supported when defining a schema. It's probably best to start with the simplest syntax. Here's an example:

### Shorthand Definitions

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({
  name: String,
  age: 'number?', // => optional
  matrix: [[Number]],
});
```

This is referred to as "shorthand" syntax. You simply map a property name to a type. When validating, FasterSchema will make sure that all of those properties are present and are set to a value of that type. For optional fields, you can use string notation of the types ending with '?'.
Array (even multi dimensional) shorthands is illustrated by the `matrix` property.

### Longhand Definitions

In many cases, you will need to use longhand in order to define additional rules beyond what the data type should be.

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({
  name: {
    type: String,
    max: 40,
  },
  age: {
    type: Number,
    optional: true,
  },
  registered: {
    type: Boolean,
    defaultValue: false,
  },
});
```

### Mixing Shorthand with Longhand

You can use any combination of shorthand and longhand:

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({
  name: 'string?',
  age: {
    type: Number,
    optional: true,
  },
  matrix: {
    type: [['number']]
  }
});
```

### More Shorthand

If you set the schema key to a regular expression, then the `type` will be `String` and the string must match the provided regular expression.

For example, this:

```js
{
  exp: /foo/
}
```

is equivalent to:

```js
{
  exp: { type: String, regEx: /foo/ }
}
```

You can also set the schema key to an array of some type:

```js
{
  friends: [String],
}
```

is equivalent to:

```js
{
  friends: { type: Array },
  'friends.$': { type: String },
}
```

### Extending Schemas

If there are certain fields that are repeated in many of your schemas, it can be useful to define a FasterSchema instance just for those fields and then merge them into other schemas:

```js
import FasterSchema from 'faster-schema';
import { idSchema, addressSchema } from './sharedSchemas';

const schema = new FasterSchema({
  name: String,
});
schema.extend(idSchema);
schema.extend(addressSchema);
```

#### Overriding When Extending

If the key appears in both schemas, the definition will be extended such that the result is the combination of both definitions.

```js
import FasterSchema from 'faster-schema';
import { idSchema, addressSchema } from './sharedSchemas';

const schema = new FasterSchema({
  name: {
    type: String,
    min: 5,
  },
});
schema.extend({
  name: {
    type: String,
    max: 15,
  },
});
```

The above will result in the definition of the `name` field becoming:

```js
{
  name: {
    type: String,
    min: 5,
    max: 15,
  },
}
```

Note also that a plain object was passed to `extend`. If you pass a plain object, it is converted to a `FasterSchema` instance for you.

### Merging schemas

You can also merge multiple schemas together

```js
import FasterSchema from 'faster-schema';
import { idSchema, addressSchema } from './sharedSchemas';

const schema = FasterSchema.merge([
  idSchema,
  addressSchema,
  {
    name: String,
  }
]);
```

### Subschemas / Schema composition

Similar to extending, you can also reference other schemas as a way to define objects that occur within the main object:

```js
import FasterSchema from 'faster-schema';
import { addressSchema } from './sharedSchemas';

const schema = new FasterSchema({
  name: String,
  homeAddress: addressSchema,
  billingAddress: {
    type: addressSchema,
    optional: true,
  },
});
```

### Extracting Schemas

Sometimes you have one large FasterSchema object, and you need just a subset of it for some purpose.

To pull out certain schema keys into a new schema, you can use the `pick` method:

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({
  firstName: String,
  lastName: String,
  username: String,
  address: Object,
  'address.street': String,
  'address.zip': Number
});

const nameSchema = schema.pick('firstName', 'lastName', 'address.*');
```

Use the wildcard to select an element and all it's children.

To keep all but certain keys in a new schema, you can use the `omit` method:

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({
  firstName: String,
  lastName: String,
  username: String,
});

const nameSchema = schema.omit('username');
```

To pull a subschema out of an `Object` key in a larger schema, you can use `getObjectSchema`:

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({
  firstName: String,
  lastName: String,
  address: Object,
  'address.street1': String,
  'address.street2': { type: String, optional: true },
  'address.city': String,
  'address.state': String,
  'address.postalCode': String,
});

const addressSchema = schema.getObjectSchema('address');

// addressSchema is now the same as this:
// new FasterSchema({
//   street1: String,
//   street2: { type: String, optional: true },
//   city: String,
//   state: String,
//   postalCode: String,
// });
```

## Schema Keys

A basic schema key is just the name of the key (property) to expect in the objects that will be validated.

Use string keys with MongoDB-style dot notation to validate nested arrays and objects. For example:

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({
  mailingAddress: Object,
  'mailingAddress.street': String,
  'mailingAddress.city': String,
});
```

To indicate array items, use a `$`:

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({
  addresses: {
    type: Array,
    minCount: 1,
    maxCount: 4
  },
  'addresses.$': Object,
  'addresses.$.street': String,
  'addresses.$.city': String,
});
```

## Schema Rules

Here are some specifics about the various rules you can define in your schema.

### type

One of the following:

* `String`
* `Number`
* `Boolean`
* `Object`
* `Array`
* Any custom or built-in class like `Date`
* Another `FasterSchema` instance, meaning `Object` type with this schema

### label

*Can also be a function that returns the label*

A string that will be used to refer to this field in validation error messages. The default is an inflected (humanized) derivation of the key name itself. For example, the key "firstName" will have a default label of "First name" if you do not include the `label` property in your definition.

You can use the `labels` function to alter one or more labels on the fly:

```js
schema.labels({
  password: "Enter your password"
});
```

To get the label for a field, use `schema.label(fieldName)`, which returns a usable string.

### optional

By default, all keys are required. Set `optional: true` to change that.

With complex keys, it might be difficult to understand what "required" means. Here's a brief explanation of how requiredness is interpreted:

* If `type` is `Array`, then "required" means that key must have a value, but an empty array is fine. (If an empty array is *not* fine, add the `minCount: 1` option.)
* For array items (when the key name ends with ".$"), the `optional` option has no effect. That is, something cannot be "required" to be in an array.
* If a key is required at a deeper level, the key must have a value *only if* the object it belongs to is present.

That last point can be confusing, so let's look at a couple examples:

* Say you have a required key "friends.address.city" but "friends.address" is optional. If "friends.address" is set in the object you're validating, but "friends.address.city" is not, there is a validation error. However, if "friends.address" is *not* set, then there is no validation error for "friends.address.city" because the object it belongs to is not present.
* If you have a required key "friends.$.name", but the `friends` array has no objects in the object you are validating, there is no validation error for "friends.$.name". When the `friends` array *does* have objects, every present object is validated, and each object could potentially have a validation error if it is missing the `name` property. For example, when there are two objects in the friends array and both are missing the `name` property, there will be a validation error for both "friends.0.name" and "friends.1.name".

### required

If you would rather have all your schema keys be optional by default, pass the `requiredByDefault: false` option and then use `required: true` to make individual keys required.

```js
const schema = new FasterSchema({
  optionalProp: String,
  requiredProp: { type: String, required: true },
}, { requiredByDefault: false });
```

### min/max

* If `type` is `Number`, these rules define the minimum or maximum numeric value.
* If `type` is `String`, these rules define the minimum or maximum string length.
* If `type` is `Date`, these rules define the minimum or maximum date, inclusive.

You can alternatively provide a function that takes no arguments and returns the appropriate minimum or maximum value. This is useful, for example, if the minimum Date for a field should be "today".

### exclusiveMin/exclusiveMax

Set to `true` to indicate that the range of numeric values, as set by min/max, are to be treated as an exclusive range. Set to `false` (default) to treat ranges as inclusive.

### minCount/maxCount

Define the minimum or maximum array length. Used only when type is `Array`.

### allowedValues

An array of values that are allowed. A key will be invalid if its value is not one of these.

You can use `schema.getAllowedValuesForKey(key)` to get the allowed values array for a key.

### regEx

Any regular expression that must be matched for the key to be valid, or an array of regular expressions that will be tested in order.

The `FasterSchema.RegEx` object defines standard regular expressions you can use as the value for the `regEx` key.
- `FasterSchema.RegEx.Email` for emails (uses a permissive regEx recommended by W3C, which most browsers use. Does not require a TLD)
- `FasterSchema.RegEx.EmailWithTLD` for emails that must have the TLD portion (.com, etc.). Emails like `me@localhost` and `me@192.168.1.1` won't pass this one.
- `FasterSchema.RegEx.Domain` for external domains and the domain only (requires a tld like `.com`)
- `FasterSchema.RegEx.WeakDomain` for less strict domains and IPv4 and IPv6
- `FasterSchema.RegEx.IP` for IPv4 or IPv6
- `FasterSchema.RegEx.IPv4` for just IPv4
- `FasterSchema.RegEx.IPv6` for just IPv6
- `FasterSchema.RegEx.Url` for http, https and ftp urls
- `FasterSchema.RegEx.Id` for IDs generated by `Random.id()` of the random package, also usable to validate a relation id.
- `FasterSchema.RegEx.ZipCode` for 5- and 9-digit ZIP codes
- `FasterSchema.RegEx.Phone` for phone numbers (taken from Google's libphonenumber library)

### blackbox

If you have a key with type `Object`, the properties of the object will be validated as well, so you must define all allowed properties in the schema. If this is not possible or you don't care to validate the object's properties, use the `blackbox: true` option to skip validation for everything within the object.

### trim

*Used by the cleaning process but not by validation*

When you call `fasterSchemaInstance.clean()` with `trimStrings` set to `true`, all string values are trimmed of leading and trailing whitespace. If you set `trim` to `false` for certain keys in their schema definition, those keys will be skipped.

### custom

Refer to the [Custom Validation](#custom-validation) section.

### defaultValue

*Used by the cleaning process but not by validation*

Set this to any value that you want to be used as the default when an object does not include this field or has this field set to `undefined`. This value will be injected into the object by a call to `myFasterSchema.clean()` with `getAutovalues: true`.

Note the following points of confusion:

* A default value itself is not cleaned. So, for example, if your default value is "", it will not be removed by the `removeEmptyStrings` operation in the cleaning.
* A default value is added only if there isn't a value set AND the parent object exists. Usually this is what you want, but if you need to ensure that it will always be added, you can add `defaultValue: {}` to all ancestor objects.

If you need more control, use the `autoValue` option instead.

To get the defaultValue for a field, use `schema.defaultValue(fieldName)`. It is a shorthand for [`schema.get(fieldName, 'defaultValue')`](#getting-field-properties).

### autoValue

*Used by the cleaning process but not by validation*

The `autoValue` option allows you to specify a function that is called by `fasterSchemaInstance.clean()` to potentially change the value of a property in the object being cleaned. This is a powerful feature that allows you to set up either forced values or default values, potentially based on the values of other fields in the object.

If an `autoValue` function does not return anything (i.e., returns `undefined`), the field will be deleted.

Any other return value will be used as the field's value.

The only argument an `autoValue` function received is an object containing the following keys:

* `isSet`: True if the field is already set in the document
* `value`: If isSet = true, this contains the field's current (requested) value in the document.
* `path`: The path in the object to clean, e.g. `object.array.0.subarray.1.field`
* `genericPath`: The generic path in the object to clean, e.g. `object.array.$.subarray.$.field`
* `rootObj`: The complete object being cleaned (in the current state of being cleaned)
* `parentObj`: The parent object of this field (in the current state of being cleaned)
* `getValue()`: Use this method to get the cleaned value of another field, you can pass a path, e.g. `object.array.0.subarray.1.field`
* `getSiblingValue()`: Use this method to get the cleaned value of a sibling field

### Getting field properties
To obtain field's property value, just call get method.
```js
const schema = new FasterSchema({
  friends: {
    type: Array,
    minCount: 0,
    maxCount: 3,
  }
});

schema.get('friends', 'maxCount'); // 3
```

## Validating Data

### Ways to Perform Validation

There are three ways to validate an object against your schema:

1. With a throwaway context, throwing an Error for the first validation error found (schema.validate())
2. With a unique unnamed validation context, not throwing any Errors (schema.newContext().validate())
3. With a unique named validation context, not throwing any Errors (schema.namedContext('someUniqueString').validate())
4. With the default validation context, not throwing any Errors. (schema.namedContext().validate())

A validation context provides reactive methods for validating and checking the validation status of a particular object.

#### Named Validation Contexts

Here is an example of obtaining a named validation context:

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({
  name: String,
});

const userFormValidationContext = schema.namedContext('userForm');
```

The first time you request a context with a certain name, it is created. Calling `namedContext()` passing no arguments is equivalent to calling `namedContext('default')`.

#### Unnamed Validation Contexts

To obtain an unnamed validation context, call `newContext()`:

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({
  name: String,
});

const myValidationContext = schema.newContext();
```

An unnamed validation context is not persisted anywhere.

### Validating an Object

To validate an object against the schema in a validation context, call `validationContextInstance.validate(obj, options)`. This method returns `true` if the object is valid according to the schema or `false` if it is not. It also stores a list of invalid fields and corresponding error messages in the context object.

You can call `myContext.isValid()` to see if the object last passed into `validate()` was found to be valid.

For a list of options, see the [Validation Options](#validation-options) section.

### Validating Only Some Keys in an Object

You may have the need to (re)validate certain keys while leaving any errors for other keys unchanged. For example, if you have several errors on a form and you want to revalidate only the invalid field the user is currently typing in. For this situation, call `myContext.validate` with the `keys` option set to an array of keys that should be validated. 

This method returns `true` only if all the specified schema keys and their descendent keys are valid according to the schema. Otherwise it returns `false`.

### Validation Options

`validate()` accepts the following options:

* `ignore`: An array of validation error types (in FasterSchema.ErrorTypes enum) to ignore.
* `keys`: An array of keys to validate. If not provided, revalidates the entire object.

### Validating and Throwing ValidationErrors

- Call `myFasterSchema.validate(obj, options)` to validate `obj` against the schema and throw a `ValidationError` if invalid.
- Call `FasterSchema.validate(obj, schema, options)` static function as a shortcut for `myFasterSchema.validate` if you don't want to create `myFasterSchema` first. The `schema` argument can be just the schema object, in which case it will be passed to the `FasterSchema` constructor for you. This is like `check(obj, schema)` but without the `check` dependency and with the ability to pass full schema error details back to a callback on the client.
- Call `myFasterSchema.validator()` to get a function that calls `myFasterSchema.validate` for whatever object is passed to it. This means you can do `validate: myFasterSchema.validator()` in the [mdg:validated-method](https://github.com/meteor/validated-method) package.

#### Customize the Error That is Thrown

You can `defineValidationErrorTransform` one time somewhere in your code to customize the error or change it to a more specific type.

```js
import FasterSchema from 'faster-schema';

FasterSchema.defineValidationErrorTransform(error => {
  const customError = new MyCustomErrorType(error.message);
  customError.errorList = error.details;
  return customError;
});
```

For example, in a Meteor app, in order to ensure that the error details are sent back to the client when throwing an error in a server method, you can convert it to a `Meteor.Error`:

```js
import FasterSchema from 'faster-schema';

FasterSchema.defineValidationErrorTransform(error => {
  const ddpError = new Meteor.Error(error.message);
  ddpError.error = 'validation-error';
  ddpError.details = error.details;
  return ddpError;
});
```

### Custom Field Validation

There are three ways to attach custom validation methods.

To add a custom validation function that is called for ALL keys in ALL schemas (for example, to publish a package that adds global support for some additional rule):

```js
FasterSchema.addValidator(myFunction);
```

To add a custom validation function that is called for ALL keys for ONE schema:

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({ ... });
schema.addValidator(myFunction);
```

To add a custom validation function that is called for ONE key in ONE schema:

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({
  someKey: {
    type: String,
    custom: myFunction,
  }
});
```

All custom validation functions work the same way. First, do the necessary custom validation, use `this` to get whatever information you need. Then, if valid, return `undefined`. If invalid, return an error type string. The error type string can be one of the [built-in strings](#manually-adding-a-validation-error) or any string you want.
* If you return a built-in string, it's best to use the `FasterSchema.ErrorTypes` constants.
* If you return a custom string, you'll usually want to [define a message for it](#customizing-validation-messages).

The custom validator receives an object as first parameter containing:

* `path`: The name of the schema path (e.g., "addresses.0.street")
* `genericPath`: The generic name of the schema key (e.g., "addresses.$.street")
* `definition`: The schema definition object.
* `rootObj`: The complete object to validate
* `parentObj`: The current field's parent object, useful to get siblin values
* `value`: The value to validate
### Custom Whole-Document Validators

Add a validator for all schemas:

```js
import FasterSchema from 'faster-schema';

FasterSchema.addDocValidator(obj => {
  // Must return an array, potentially empty, of objects with `name` and `type` string properties and optional `value` property.
  return [
    { name: 'firstName', type: 'TOO_SILLY', value: 'Reepicheep' }
  ];
});
```

Add a validator for one schema:

```js
import FasterSchema from 'faster-schema';

const schema = new FasterSchema({ ... });
schema.addDocValidator(obj => {
  // Must return an array, potentially empty, of objects with `name` and `type` string properties and optional `value` property.
  return [
    { name: 'firstName', type: 'TOO_SILLY', value: 'Reepicheep' }
  ];
});
```

### Manually Adding a Validation Error

If you want to display an arbitrary validation error and it is not possible to use a custom validation function (perhaps you have to call a function `onSubmit` or wait for asynchronous results), you can add one or more errors to a validation context at any time by calling `myContext.addValidationErrors(errors)`, where `errors` is an array of error objects with the following format:

```js
{name: key, type: errorType, value: anyValue}
```

* `name`: The schema key as specified in the schema.
* `type`: The type of error. Any string you want, or one of the strings in the `FasterSchema.ErrorTypes` list.
* `value`: Optional. The value that was not valid. Will be used to replace the
`[value]` placeholder in error messages.

If you use a custom string for `type`, be sure to define a message for it. (See [Customizing Validation Messages](#customizing-validation-messages)).

Example:

```js
FasterSchema.setDefaultMessages({
  messages: {
    en: {
      customError({label, value}){ return `Wrong value: ${value} for field ${label}` },
    },
  },
});

myValidationContext.addValidationErrors([{ name: 'myField', label: 'MyField', value: 'foo' type: 'customError' }]);
```

### Getting a List of Invalid Keys and Validation Error Messages

Call `myValidationContext.validationErrors()` to get the full array of validation errors. Each object in the array has at least two keys:
* `name`: The schema key as specified in the schema.
* `type`: The type of error. See `FasterSchema.ErrorTypes`.

There may also be a `value` property, which is the value that was invalid.

There may be a `message` property, but usually the error message is constructed from message templates. You should call `ctxt.keyErrorMessage(key)` to get a reactive message string rather than using `error.message` directly.

## Customizing Validation Messages

In most cases you probably want to set default messages to be used by all `FasterSchema` instances. Example:

```js
FasterSchema.setDefaultMessages({
  messages: {
    en: {
      "too_long"({label}){ return `${label} is too long!` },
    },
  },
});
```

## Other Validation Context Methods

`myContext.keyIsInvalid(key)` returns true if the specified key is currently
invalid, or false if it is valid. This is a reactive method.

`myContext.keyErrorMessage(key)` returns the error message for the specified
key if it is invalid. If it is valid, this method returns an empty string. This
is a reactive method.

Call `myContext.reset()` if you need to reset the validation context, clearing out any invalid field messages and making it valid.

## Other FasterSchema Methods

Call `MySchema.schema([key])` to get the schema definition object. If you specify a key, then only the schema definition for that key is returned.

Note that this may not match exactly what you passed into the FasterSchema constructor. The schema definition object is normalized internally, and this method returns the normalized copy.

## Cleaning Objects

You can call `fasterSchemaInstance.clean()` or `fasterSchemaValidationContextInstance.clean()` to clean the object you're validating. Do this prior to validating it to avoid any avoidable validation errors.

The `clean` function takes the object to be cleaned as its first argument and the following optional options as its second argument:

* `mutate`: The object is copied before being cleaned. If you don't mind mutating the object you are cleaning, you can pass `mutate: true` to get better performance.
* `filter`: `true` by default. If `true`, removes any keys not explicitly or implicitly allowed by the schema, which prevents errors being thrown for those keys during validation.
* `autoConvert`: `true` by default. If `true`, helps eliminate unnecessary validation messages by automatically converting values where possible.
  * Non-string values are converted to a String if the schema expects a String
  * Strings that are numbers are converted to Numbers if the schema expects a Number
  * Strings that are "true" or "false" are converted to Boolean if the schema expects a Boolean
  * Numbers are converted to Boolean if the schema expects a Boolean, with 0 being `false` and all other numbers being `true`
  * Non-array values are converted to a one-item array if the schema expects an Array
* `removeEmptyStrings`: Remove keys in normal object or $set where the value is an empty string? True by default.
* `trimStrings`: Remove all leading and trailing spaces from string values? True by default.
* `getAutoValues`: Run `autoValue` functions and inject automatic and `defaultValue` values? True by default.

You can also set defaults for any of these options in your FasterSchema constructor options:

```js
const schema = new FasterSchema({
  name: String
}, {
  clean: {
    trimStrings: false,
  },
});
```

## Dates

For consistency, if you care only about the date (year, month, date) portion and not the time, then use a `Date` object set to the desired date at midnight UTC *(note, the clean function won't strip out time)*. This goes for `min` and `max` dates, too. If you care only about the date
portion and you want to specify a minimum date, `min` should be set to midnight UTC on the minimum date (inclusive).

Following these rules ensures maximum interoperability with HTML5 date inputs and usually just makes sense.

## Best Practice Code Examples

### Make a field conditionally required

If you have a field that should be required only in certain circumstances, first make the field
optional, and then use a custom function similar to this:

```js
{
  field: {
    type: String,
    optional: true,
    custom: function ({value, isSet, getValue}) {
      let shouldBeRequired = getValue('saleType') === 1;
      if (shouldBeRequired) {
        if (!isSet || value === null || value === "") return FasterSchema.ErrorTypes.REQUIRED;
      }
    }
  }
}
```

Where `customCondition` is whatever should trigger it being required.

### Validate one key against another

Here's an example of declaring one value valid or invalid based on another
value using a custom validation function.

```js
FasterSchema.messageBox.messages({
  en: {
    passwordMismatch(){ return 'Passwords do not match' },
  },
});

MySchema = new FasterSchema({
  password: {
    type: String,
    label: "Enter a password",
    min: 8,
  },
  confirmPassword: {
    type: String,
    label: "Enter the password again",
    min: 8,
    custom({value, getValue}) {
      if (value !== getValue('password')) {
        return "passwordMismatch";
      }
    },
  },
});
```
## License

MIT

## Contributing

Anyone is welcome to contribute. Before submitting a pull request, make sure that you've added tests for your changes, and that all tests pass when you run `npm test`.

### Thanks

(Add your name if it's missing.)

- @aldeed for the simple schema package, which this package is based off.

