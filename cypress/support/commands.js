// Import necessary modules and data at the top
const accountsPermission = require('../fixtures/scope_accounts_read.json');
const authorized = require('../fixtures/authorized.json');
const rejected = require('../fixtures/rejected.json');
const jwtToken = Cypress.env('JWT_ACCESS_TOKEN');

let authorization = '';

// Use template literals for URLs
const BASE_API_URL = '/test-api';

Cypress.Commands.add('getAccounts', () => {
  cy.generateToken('consents accounts').then((authorization) => {
    cy.createConsent(authorization).then(({ status, body }) => {
      expect(status).to.eq(201);
      const consentId = body.data.consentId;
      cy.updateConsent(authorization, consentId, 'Authorized');
      cy.generateToken('account', consentId).then((authorization) => {
        cy.request({
          method: 'GET',
          url: `${BASE_API_URL}/accounts/v1/accounts/`,
          headers: { Authorization: `Bearer ${authorization}` },
        });
      });
    });
  });
});

Cypress.Commands.add('getAccount', (id) => {
  cy.getAccounts().then((res) => {
    const authorization = res.requestHeaders['Authorization'];
    const accountId =
      typeof id === undefined || typeof id === 'string'
        ? id
        : res.body.data[0].id;

    // const accountId = res.body.data[0].id;
    cy.request({
      method: 'GET',
      url: `${BASE_API_URL}/accounts/v1/account/${accountId}`,
      failOnStatusCode: false,
      headers: { Authorization: `${authorization}` },
    });
  });
});

Cypress.Commands.add('getAccountNoAuth', (id) => {
  cy.getAccounts().then((res) => {
    const authorization = res.requestHeaders['Authorization'];
    const accountId =
      typeof id === undefined || typeof id === 'string'
        ? id
        : res.body.data[0].id;
    cy.request({
      method: 'GET',
      url: `${BASE_API_URL}/accounts/v1/account/${accountId}`,
      failOnStatusCode: false,
      headers: { Authorization: `${authorization} test` },
    });
  });
});

Cypress.Commands.add('getAccountsWithNoPermission', () => {
  cy.consentFlow('Authorized');
  cy.generateToken('accounts').then((authorization) => {
    cy.request({
      method: 'GET',
      url: `${BASE_API_URL}/accounts/v1/accounts/`,
      failOnStatusCode: false,
      headers: { Authorization: `Bearer ${authorization}` },
    });
  });
});

Cypress.Commands.add('getAccountsWithNoAuth', () => {
  cy.consentFlow('Authorized');
  cy.generateToken('accounts').then((authorization) => {
    cy.request({
      method: 'GET',
      url: `${BASE_API_URL}/accounts/v1/accounts/`,
      failOnStatusCode: false,
      headers: { Authorization: `Bearer ${authorization} test` },
    });
  });
});

Cypress.Commands.add('getAccountsWithRejectedConsent', () => {
  cy.generateToken('consents accounts').then((authorization) => {
    cy.createConsent(authorization).then(({ status, body }) => {
      expect(status).to.eq(201);
      const consentId = body.data.consentId;
      cy.updateConsent(authorization, consentId, 'Rejected');
      cy.generateToken('accounts', consentId).then((authorization) => {
        cy.request({
          method: 'GET',
          url: `${BASE_API_URL}/accounts/v1/accounts/`,
          failOnStatusCode: false,
          headers: { Authorization: `Bearer ${authorization}` },
        });
      });
    });
  });
});

Cypress.Commands.add('consentFlow', (type) => {
  cy.generateToken('consent').then((authorization) => {
    cy.createConsent(authorization).then(({ status, body }) => {
      expect(status).to.eq(201);
      const consentId = body.data.consentId;
      cy.updateConsent(authorization, consentId, type);
    });
  });
});

Cypress.Commands.add('generateToken', (type, consent) => {
  const obj = getAuthTokenObject(type, consent);
  const encoded = btoa(JSON.stringify(obj));
  authorization = `${jwtToken}${encoded}.`;

  return authorization;
});

function getAuthTokenObject(type, consent) {
  let scope;
  switch (type) {
    case 'consents':
      scope = 'consents';
      break;
    case 'consent':
      scope = `consents consent:${consent}`;
      break;
    case 'consents accounts':
      scope = 'consents accounts';
      break;
    case 'accounts':
      scope = 'accounts';
      break;
    case 'account':
      scope = `consents accounts consent:${consent}`;
      break;
  }

  return { scope, client_id: 'client1' };
}

Cypress.Commands.add('createConsent', (authorization) => {
  cy.request({
    method: 'POST',
    url: `${BASE_API_URL}/consents/v1/consents`,
    headers: { Authorization: `Bearer ${authorization}` },
    body: accountsPermission,
  });
});

Cypress.Commands.add('updateConsent', (authorization, id, status) => {
  const updateBody = status === 'Authorized' ? authorized : rejected;
  cy.request({
    method: 'PUT',
    url: `${BASE_API_URL}/consents/v1/consents/${id}`,
    headers: { Authorization: `Bearer ${authorization}` },
    body: updateBody,
  });
});
