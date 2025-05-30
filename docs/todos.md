# Project To-Do List

## README.md

- [ ] find out why the npm package badge says not found
- [ ] find out why codecov badge says unknown
- [ ] improve quickstart in readme
  - [ ] remove unused imports
  - [ ] confirm SupabaseQueryBuilder is a thing
  - [ ] mention that pagination types are in types and confirm they are exported
- [ ] could we improve the RepositoryFactory to not create new instances every time?

## CONTRIBUTING.md

- [ ] add bun run format to development setup
- [ ] avoid duplicating convention commits documentation and link to it
- [ ] add commitlint to `code style` and `Pull Request Process` sections

## package.json

- [ ] find out if @supabase/supabase-js and drizzle are dependencies or peer-dependencies according to the readme and
  the package.json
- [ ] add Changelog, License, Contribution Guide to packaged files
- [ ] add missing properties to package.json ( maintainer, homepage, bugs, repository, license, keywords)

## src

- [ ] add typedoc blocks (to all classes, methods, properties and types) in the src directory
- manually verify that `any` can not be replaced with `unknown`

## changelogs

- [ ] add a changelog helper module
- [ ] make sure a tag exists for each release

## docs

- [ ] where is docs linked from?
- [ ] consider a docs TOC linked from readme

## other

- [ ] fix example/user-repository.ts IDE errors
