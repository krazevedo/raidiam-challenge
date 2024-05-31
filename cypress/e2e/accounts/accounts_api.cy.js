import { faker } from '@faker-js/faker';
const accounts = require('../../fixtures/accounts.json');

describe('Accounts API tests', () => {
  it('[BUG] get accounts successfully retrieves accounts information', () => {
    cy.getAccounts().should(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.length).to.be.above(0);
      body.data.forEach(checkAccounts);
    });
  });

  it('get accounts returns a 403 for a non-present consent ID', () => {
    cy.getAccountsWithNoAccountScope().should(({ status, body }) => {
      expect(status).to.eq(403);
      expect(body._embedded.errors[0].message).to.eq(
        `Consent Id not present on the request`
      );
    });
  });

  it('get accounts returns a 403 for a non-account permission', () => {
    cy.getAccountsWithNoAccountPermission().should(({ status, body }) => {
      expect(status).to.eq(403);
      expect(body._embedded.errors[0].message).to.include(
        "doesn't have right permissions"
      );
    });
  });

  it('get accounts returns a 403 for a rejected consent ID', () => {
    cy.getAccountsWithRejectedConsent().should(({ status, body }) => {
      expect(status).to.eq(403);
      expect(body._embedded.errors[0].message).to.eq(
        `Consent Id not present on the request`
      );
    });
  });

  it('get accounts returns a 401 for a non-auth user', () => {
    cy.getAccountsWithNoAuth().should(({ status, body }) => {
      expect(status).to.eq(401);
      expect(body._embedded.errors[0].message).to.eq(`Unauthorized`);
    });
  });

  it('[BUG] get account fetches account details for a valid account ID', () => {
    cy.getAccount().then(({ status, body }) => {
      expect(status).to.eq(200);
      checkAccounts(body.data, 0);
    });
  });

  it('get account returns a 401 for a non-auth user', () => {
    cy.getAccountNoAuth().then(({ status, body }) => {
      expect(status).to.eq(401);
      expect(body._embedded.errors[0].message).to.eq(`Unauthorized`);
    });
  });

  it('get account returns a 500 for an invalid account ID', () => {
    const accountId = 'test';
    cy.getAccount(accountId).should(({ status, body }) => {
      expect(status).to.eq(500);
      expect(body._embedded.errors[0].message).to.include(
        `Invalid UUID string: ${accountId}`
      );
    });
  });

  it('get account returns a 403 for a missing account ID', () => {
    const accountId = '';
    cy.getAccount(accountId).should(({ status, body }) => {
      expect(status).to.eq(403);
    });
  });

  it('get account returns a 404 for a wrong account ID', () => {
    const accountId = faker.string.uuid();
    cy.getAccount(accountId).should(({ status, body }) => {
      expect(status).to.eq(404);
      expect(body._embedded.errors[0].message).to.eq(
        `Account Id ${accountId} not found`
      );
    });
  });

  it('[BUG] get account returns a 403 for a non-present consent ID', () => {
    cy.getAccountsWithNoAccountScope().then((res) => {
      const auth = res.requestHeaders['Authorization'];
      const accountId = accounts.data[0].id;
      cy.getAccount(accountId, auth).then(({ status, body }) => {
        expect(status).to.eq(403);
        expect(body._embedded.errors[0].message).to.eq(
          `Consent Id not present on the request`
        );
      });
    });
  });

  // Helper function to check account information
  function checkAccounts(element, index) {
    expect(element.accountNumber).to.exist;
    expect(element.bank).to.exist;
    expect(element.id).to.exist;
    expect(element.creationDateTime).to.exist;

    expect(element.accountNumber).to.eq(accounts.data[index].accountNumber);
    expect(element.bank).to.eq(accounts.data[index].bank);
    expect(element.id).to.eq(accounts.data[index].id);
  }
});
