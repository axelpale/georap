# Design approaches

Content management systems can be designed on different paradigms. This doc explores some of the most difficult requirements and their solutions.

## Grouping of locations

Geographical hierarchy would be the most natural.

Country, county, etc. (can be queried automatically)

The naming of locations in spoken language is important factor for hierarchy. For example KP, KP:n katto, KP:n voimala...

How many levels of hierarchy are needed?

Explicit discrimination between sublocations and related locations?

Can one location have multiple points? That would solve sublocations and simple geometry.

## Geometry

Areas, lines, points. Points so simple.

Result: Multiple points per location is enough.

## Voting and starring

Simple 1 to 5 starring. When aggregating, consider hypothetical normal distribution of stars and logarithm of the scenepoints of the voter.

## Public locations

Yes. Could be implemented quite easily with a public tag. This makes it easier to get monetary support and historical value.

## Personal location history

Let us target the mobile usability first.
