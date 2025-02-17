/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-env mocha */

'use strict';

const assert = require('assert');

const {
  IT_DEFAULT_TIMEOUT,
  TestBrowser,
  Nock,
  Setup,
} = require('./utils.js');
const { SidekickTest } = require('./SidekickTest.js');

describe('Test sidekick logout', () => {
  /** @type TestBrowser */
  let browser;

  before(async function before() {
    this.timeout(10000);
    browser = await TestBrowser.create();
  });

  after(async () => browser.close());

  let page;
  let nock;

  beforeEach(async () => {
    page = await browser.openPage();
    nock = new Nock();
  });

  afterEach(async () => {
    await browser.closeAllPages();
    nock.done();
  });

  it('Logout removes auth token from config', async () => {
    nock.admin(new Setup('blog'));
    nock('https://admin.hlx.page')
      .get('/logout')
      .reply(200, {});
    nock.admin(new Setup('blog'));
    const test = new SidekickTest({
      browser,
      page,
      plugin: 'user-logout',
      sleep: 2000,
      checkPage: async (p) => p.evaluate(() => window.hlx.sidekick.config),
    });
    test.sidekickConfig.authToken = 'foobar';
    const { checkPageResult: config } = await test.run();

    assert.ok(!config.authToken, 'Did not remove auth token from config');
  }).timeout(IT_DEFAULT_TIMEOUT);
});
