# Predictive Market Using Arria

This code pattern demonstrates how to compute a stress test using the Predictive Market Scenario service and Simulated Instrument Analytics service on a set of investments maintained in the Investment Portfolio service, and then narrate the results using the Arria NLG service.

This code pattern is designed for developers with interest in creating financial applications pertaining to investment portfolios.  When the reader has completed this code pattern, they will understand how to:

- Load and retrieve data from the Investment Portfolio service
- Use the Predictive Market Scenario service to generate a scenario
- Send data along with a scenario to the Simulated Instrument Analytics service to retrieve analytics
- Pipe the results to the Arria NLG service which generates a human-readable interpretation of the results

## Architecture flow

<p align="center">
  <img width="800"  src="readme_images/Portfolio.Narrate Architecture.png">
</p>

## Included Components

Offered on [IBM Cloud](https://console.bluemix.net/):

- [Investment Portfolio](https://console.ng.bluemix.net/catalog/services/investment-portfolio)
- [Predictive Market Scenario](https://console.ng.bluemix.net/catalog/services/predictive-market-scenarios)
- [Simulated Instrument Analytics](https://console.ng.bluemix.net/catalog/services/simulated-instrument-analytics)
- [Arria NLG](https://console.bluemix.net/catalog/services/natural-language-generation-apis)

> **NOTE:** These services are free for those who have a Lite account.

## Automatically Deploying the Application to IBM Cloud

[![Deploy to IBM Cloud](https://bluemix.net/deploy/button.png)](https://bluemix.net/devops/setup/deploy?repository=https://github.com/IBM/predictive-market-using-arria)

You will need to [create Arria service](#1-create-arria-service) in IBM Cloud and then bind the Arria NLG service to your application.

Go to your application page in IBM Cloud, under Connections choose `Create Connection`:

<p align="left">
  <img width="450" src="readme_images\create_connection.png">
</p>

Find your Arria Natural Language Generation service and choose `Connect`:

<p align="left">
  <img width="850" src="readme_images\connect_service.png">
</p>

Next, load investment portfolio before running the application. First [clone the repo](#3-clone-the-repo) and then use the `investmentPortfolio.js` script to [load your portfolio](#5-load-investment-portfolio).

## Manually Deploying the Application to IBM Cloud
Follow these steps to setup and run this pattern. The steps are described in detail below.

### Prerequisites

- [node](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [IBM Cloud account](https://console.bluemix.net/registration/?target=%2Fdashboard%2Fapps)
- [IBM Cloud CLI](https://console.bluemix.net/docs/cli)

### Steps

1. [Create Arria service](#1-create-arria-service)
2. [Create IBM Cloud services](#2-create-ibm-cloud-services)
3. [Clone the repo](#3-clone-the-repo)
4. [Configure .env file](#4-configure-env-file)
5. [Load Investment Portfolio](#5-load-investment-portfolio)
6. [Run Application](#5-run-application)
7. [Deploy to IBM Cloud](#6-deploy-to-ibm-cloud)

## 1. Create Arria service

You will need Arria API key. Register for an Arria account [here](https://nlgapi.arria.com/#/register). Click `Get Started` to sign up for an account.

<p align="left">
  <img width="650" src="readme_images\arria_register.png">
</p>

After you have created your account, then login. Click `Your API Key`.  This will take you to your API key, which will be required in subsequent steps.

<p align="left">
  <img width="650" src="readme_images\arria_api_key.png">
</p>

Explore `Narrative APIs`. Here under `Portfolio Management`, find `Predictive Market Stress Testing`.

<p align="left">
  <img width="650" src="readme_images\arria_narratives.png">
</p>

Next, create the Arria service in IBM Cloud.

- [**Arria Natural Language Generation APIs**](https://console.bluemix.net/catalog/services/natural-language-generation-apis)

For the `Arria Natural Language Generation API` service in IBM Cloud you will need to provide your API Key from Arria.

For the url provide: `https://stresstesting-narrativeapi.arria.com/services/rest/fullnarrative`.  Click `Create` to create the service in IBM Cloud.

<p align="left">
  <img width="850" src="readme_images\arria_service.png">
</p>

## 2. Create IBM Cloud services

Create the following services in IBM Cloud for financial services:

- [**Investment Portfolio**](https://console.ng.bluemix.net/catalog/services/investment-portfolio)
- [**Predictive Market Scenario**](https://console.ng.bluemix.net/catalog/services/predictive-market-scenarios)
- [**Simulated Instrument Analytics**](https://console.ng.bluemix.net/catalog/services/simulated-instrument-analytics)

For each service, go to `service credentials` on the left tab. Select `New Credentials`

<p align="left">
  <img width="950" src="readme_images\find_credentials.png">
</p>

Choose a name for your credentials, click `Add`:

<p align="left">
  <img width="450" src="readme_images\add_credentials.png">
</p>

This will add credentials to your service.

## 3. Clone the repo

Clone the `Predict Market Using Arria repo` locally. In a terminal, run:

```shell
$ git clone https://github.com/IBM/predictive-market-using-arria.git
```

## 4. Configure .env file

Create a `.env` file in the root directory of your clone of the project repository by copying the sample `.env.example` file using the following command in terminal:

```shell
$ cp .env.example .env
```

> **NOTE:** Most files systems regard files with a "." at the front as hidden files.  If you are on a Windows system, you should be able to use either [GitBash](https://git-for-windows.github.io/) or [Xcopy](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/xcopy)

You will need to update the credentials with the IBM Cloud credentials for each of the services you created in [Step 2](#2-create-ibm-cloud-services).

The `.env` file will look something like the following:

```bash
# Investment Portfolio
CRED_PORTFOLIO_USERID_W=
CRED_PORTFOLIO_PWD_W=
CRED_PORTFOLIO_USERID_R=
CRED_PORTFOLIO_PWD_R=
CRED_PORTFOLIO_URL=https://investment-portfolio.mybluemix.net/

# Predictive Market Scenario
CRED_PREDICTIVE_MARKET_SCENARIO_URL=https://fss-analytics.mybluemix.net/
CRED_PREDICTIVE_MARKET_SCENARIO_ACCESSTOKEN=

# Simulated Instrument Analytics
CRED_SIMULATED_INSTRUMENT_ANALYTICS_URL=https://fss-analytics.mybluemix.net/
CRED_SIMULATED_INSTRUMENT_ANALYTICS_ACCESSTOKEN=

# Arria Natural Language Generation
CRED_ARRIA_NATURAL_LANGUAGE_GENERATION_URL=https://stresstesting-narrativeapi.arria.com/services/rest/fullnarrative
CRED_ARRIA_NATURAL_LANGUAGE_GENERATION_KEY=
CRED_ARRIA_NATURAL_LANGUAGE_GENERATION_FACTORS=factors.csv
CRED_ARRIA_NATURAL_LANGUAGE_GENERATION_VSV=vcv.csv
```

## 5. Load Investment Portfolio

You will now need to create a portfolio in your Investment Portfolio service and create holdings for that portfolio. The `holdings.sample.json` file provides you with sample holdings for a portfolio.  

You can use the `investmentPortfolio.js` script to load portfolio and holdings.  The credentials for Investment Portfolio service are retrieved from `.env` file as per the [previous step](#4-configure-env-file) or can be added directly to the script.

<p align="left">
  <img width="650" src="readme_images\investment_portfolio_cred.png">
</p>

To load a portfolio named `MyFixedIncomePortfolio`, first install dependencies and use the command-line with the `investmentPortfolio.js` script to create portfolio.  In the project directory, run the following commands in terminal:

```shell
$ npm install
$ node investmentPortfolio.js -l MyFixedIncomePortfolio
```

To load holdings from `holdings.sample.json` into `MyFixedIncomePortfolio`, run:

```shell
$ node investmentPortfolio.js -l MyFixedIncomePortfolio -h holdings.sample.json
```

Similarly you can view your portfolios by running:

```shell
$ node investmentPortfolio.js -g
```

and view holdings for portfolio:

```shell
$ node investmentPortfolio.js -g MyFixedIncomePortfolio
```

## 6. Run Application

In your terminal, `cd` into this project's root directory

1. Run `npm install` to install the app's dependencies
1. Run `node app.js`
1. Access the running app locally at http://

## 7. Deploy to IBM Cloud

Edit the `manifest.yml` file in the folder that contains your code and replace with a unique name for your application. The name that you specify determines the application's URL, such as `your-application-name.mybluemix.net`. Additionally - update the service names so they match what you have in IBM Cloud. The relevant portion of the `manifest.yml` file looks like the following:

```yaml
applications:
- path: .
  memory: 256M
  instances: 1
  domain: mybluemix.net
  name: arria-predictive-market
  host: arria-predictive-market
  disk_quota: 256M
  buildpack: sdk-for-nodejs
  services:
  - {Investment-Portfolio service name}
  - {Predictive-Market-Scenarios service name}
  - {Simulated-Instrument-Analytics service name}
  - {Arria-Natural-Language-Generaton service name}
```

> **NOTE:** Add the name of your Arria NLG service to manifest file. This will deploy the application with the service without having to bind later.

Once the manfiest.yml file is configured, you can push to IBM Cloud. From your root directory login into IBM Cloud using CLI:

```shell
$ bx login
```

And push the app to IBM Cloud:

```shell
$ bx push
```

## Troubleshooting

- To troubleshoot your IBM Cloud application, use the logs. To see the logs, run:

    ```shell
    $ bx logs <application-name> --recent
    ```

- If you are running locally, inspect your environment variables closely to confirm they match.

## License

Copyright © 2017-2018 IBM. Licensed [Apache 2.0](LICENSE)
