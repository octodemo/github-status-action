import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'
import makeStatus, { StatusRequest } from './makeStatusRequest'
import makeStatusRequest from './makeStatusRequest';
import { RequestParameters } from '@octokit/types';

async function run(): Promise<void> {
  const authToken: string = core.getInput('authToken');
  let octokit: Octokit | null = null;

  const baseUrl = process.env.GITHUB_API_URL || 'https://api.github.com';

  try {
    octokit = new Octokit({
      auth: authToken,
      userAgent: "github-status-action",
      baseUrl: baseUrl,
      log: {
        debug: () => { },
        info: () => { },
        warn: console.warn,
        error: console.error
      },
      request: {
        agent: undefined,
        fetch: undefined,
        timeout: 0
      }
    });
  } catch (error) {
    core.setFailed("Error creating octokit:\n" + error.message);
    return;
  }

  if (octokit == null) {
    core.setFailed("Error creating octokit:\noctokit was null");
    return;
  }

  let statusRequest: StatusRequest
  try {
    statusRequest = makeStatusRequest();
  }
  catch (error) {
    core.setFailed(`Error creating status request object: ${error.message}`);
    return;
  }

  try {   
    await octokit.rest.repos.createCommitStatus(statusRequest);
  } catch (error) {
    core.setFailed(`Error setting status:\n${error.message}\nRequest object:\n${JSON.stringify(statusRequest, null, 2)}`);
  }
}

run();
