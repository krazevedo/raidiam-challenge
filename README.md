# Raidiam Test Challenge

Sample project to Raidiam Technical Test Challenge with [Customer Data API](https://bitbucket.org/thiagohcn/customer-data-apijava/src/master/).

## Pre-requirements

It is required to have Node.js and npm installed to run this project.

> I used versions `v20.13.1` and `10.5.2` of Node.js and npm, respectively. I suggest you use the same or later versions.

## Installation

Run `npm install` (or `npm i` for the short version) to install the dev dependencies.

## Tests

> **Note:** Before running the tests, make a copy of the [`cypress.env.example.json`](./cypress.env.example.json) file as `cypress.env.json`, and update the `JWT_ACCESS_TOKEN` accordingly.
>
> The `cypress.env.json` file is included on [`.gitignore`](./.gitignore) and you're safe that confidential info won't be versioned.

Run `npm test` (or `npm t` for the short version) to run the test in headless mode.

Or, run `npm run cy:open` to open Cypress in interactive mode.

---

This project was created by [Kaio Azevedo].
