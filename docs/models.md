# Data models

## Resource

Abstraction for common fields. Scenepoints are computed from these entries.

- create_user_id
- create_time
- update_user_id
- update_time
- delete_user_id
- delete_time
- table_id  (two-way referencing, resource type)
- entry_id

## Location

- resource_id
- name
- stars_cache

## Story

Replacement of location description. A method to separate descriptions and on the other hand combine description and comments.

- resource_id
- location_id
- content (MarkDown)

## Spot

Single point. A location can have many Spots. A spot can have a name, defaults to the location name.

- resource_id
- location_id
- latitude
- longitude
- name

## User

- resource_id
- name
- email
- password_hash
- scenepoints_cache
- admin

## Visit

A scenepoint source. Single per user. The oldest year counts.

- resource_id
- spot_id
- user_id
- year

## Photo

- resource_id
- location_id
- file_url
- file_path
- thumbnail_url
- thumbnail_path
- caption (text)

## Document

Any file.

- resource_id
- location_id
- file_url
- file_path
- thumbnail_url
- thumbnail_path
- caption

## RelatedLocation

Bidirectional many-to-many

- resource_id
- location_id
- location_id

## Tag

Admin addable.

- resource_id
- name
- description
- file_url
- file_path
- thumbnail_url
- thumbnail_path

## LocationTag

A many-to-many between locations and tags.

- resource_id
- location_id
- tag_id

## LocationVote

Single vote per user per location. New vote replaces the previous.

- resource_id
- user_id  (found in resource_id but replacement constraint easier to do)
- location_id
- stars (1 to 5)


## General discussion

A storyboard of a database location, shown on login page.
