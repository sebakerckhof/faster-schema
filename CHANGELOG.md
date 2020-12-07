<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [faster-schema CHANGELOG](#faster-schema-changelog)
  - [2.0.0 (07-12-2020)](#200-07-12-2020)
  - [1.0.1 (14-10-2019)](#101-14-10-2019)
  - [1.0.0 (09-10-2019)](#100-09-10-2019)
  - [0.0.19 (09-10-2019)](#0019-09-10-2019)
  - [0.0.18 (07-06-2019)](#0018-07-06-2019)
  - [0.0.16 (15-05-2019)](#0016-15-05-2019)
  - [0.0.15 (20-09-2018)](#0015-20-09-2018)
  - [0.0.14 (14-06-2018)](#0014-14-06-2018)
  - [0.0.13 (11-06-2018)](#0013-11-06-2018)
  - [0.0.12 (13-05-2018)](#0012-13-05-2018)
  - [0.0.10 (12-03-2018)](#0010-12-03-2018)
  - [0.0.4 (07-12-2017)](#004-07-12-2017)
  - [0.0.1 (06-12-2017)](#001-06-12-2017)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# faster-schema CHANGELOG

## 2.0.0 (07-12-2020)

- Fix filter and getAutoValue clean options

**Breaking change**
Some auto values may not have been filled in correctly before.
This impacts the default behavior from the clean function.


## 1.0.1 (14-10-2019)

- Don't throw when returning a custom error type that has not been defined


## 1.0.0 (09-10-2019)

1.0.0 release.
This has been used in many production applications running for years now, so it seemed valid to name it 1.0.0.

## 0.0.19 (09-10-2019)

- Allow overriding default values when merging schemas
- Improve error messages for allowed values

## 0.0.18 (07-06-2019)

- Add missing isSet to custom validation functions
- Allow to retrieve the schema from the validator

## 0.0.16 (15-05-2019)

- Don't allow arrays to be validated as objects

## 0.0.15 (20-09-2018)

- Improve pre-defined regexps
- Dont convert undefined to array when cleaning

## 0.0.14 (14-06-2018)

- Clean now checks if object is of the same instance

## 0.0.13 (11-06-2018)

- Fix auto value edge case when a non constructable object was passed

## 0.0.12 (13-05-2018)

- Fix cleaning array values

## 0.0.10 (12-03-2018)

Cleaning an object now also cleans values not in the 'allowedValues' list.

## 0.0.4 (07-12-2017)

Various small fixes

## 0.0.1 (06-12-2017)

Initial release
