# predictive-market-using-arria

This Pattern demonstrates how to compute a stress test using the Predictive Market Scenario service and Simulated Instrument Analytics service on a set of investments maintained in the Investment Portfolio service, and then narrate the results using the Arria NLG service.

When the reader has completed this journey, they will understand how to:

* Load and retrieve data from the Investment Portfolio service
* Use the Predictive Market Scenario service to generate a scenario
* Send data along with a scenario to the Simulated Instrument Analytics service to retrieve analytics
* Pipe the results to the Arria NLG service which generates a human-readable interpretation of the results

<p align="center">
  <img width="800"  src="readme_images/Portfolio.Narrate Architecture.png">
</p>


## Included Components
+ Bluemix Investment Portfolio
+ Bluemix Predictive Market Scenario
+ Bluemix Simulated Instrument Analytics
+ Arria NLG

# Automatically Deploying the Application to IBM Cloud

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/devops/setup/deploy?repository=https://github.com/IBM/predictive-market-using-arria.git)

Be sure to [load investment portfolio](#4-load-investment-portfolio) before running the application.

# Manually Deploying the Application to IBM Cloud
Follow these steps to setup and run this pattern. The steps are described in detail below.

## Prerequisite
- [node](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)

## Steps
1. [Clone the repo](#1-clone-the-repo)
2. [Create Bluemix services](#2-create-bluemix-services)
3. [Configure .env file](#3-configure-env-file)
4. [Load Investment Portfolio](#4-load-investment-portfolio)
5. [Run Application](#5-run-application)
6. [Deploy to IBM Cloud](#6-deploy-to-ibm-cloud)


## 1. Clone the repo

Clone the `Predict Market Using Arria repo` locally. In a terminal, run:

  `$ git clone https://github.com/IBM/predictive-market-using-arria.git`


## 2. Create Bluemix services

Create the following services in IBM Cloud:

* [**Investment Portfolio**](https://console.ng.bluemix.net/catalog/services/investment-portfolio)
* [**Predictive Market Scenario**](https://console.ng.bluemix.net/catalog/services/predictive-market-scenarios)
* [**Simulated Instrument Analytics**](https://console.ng.bluemix.net/catalog/services/simulated-instrument-analytics)
* [**Arria Natural Language Generation APIs**](https://console.bluemix.net/catalog/services/natural-language-generation-apis)

<br>For the `Arria Natural Language Generation API` service, you will need to register [here](https://nlgapi.arria.com/#/register).  Once registered, you will need to retrieve the API key. <br>
For the url provide: 'https://stresstesting-narrativeapi.arria.com/services/rest/fullnarrative'


## 3. Configure .env file

Create a `.env` file in the root directory of your clone of the project repository by copying the sample `.env.example` file using the following command:

  ```none
  cp .env.example .env
  ```

  **NOTE** Most files systems regard files with a "." at the front as hidden files.  If you are on a Windows system, you should be able to use either [GitBash](https://git-for-windows.github.io/) or [Xcopy](https://www.microsoft.com/resources/documentation/windows/xp/all/proddocs/en-us/xcopy.mspx?mfr=true)

You will need to update the credentials with the Bluemix credentials for each of the services you created in [Step 2](#2-create-bluemix-services).

The `.env` file will look something like the following:

  ```none  
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

## 4. Load Investment Portfolio

You will now need to create a portfolio in your Investment Portfolio service and create holdings for that portfolio. The `holdings.sample.json` file provides you with sample holdings for a portfolio.  You can run the `investmentPortfolio.js` script to load portfolio and holdings.  The credentials are retrieved from `.env` file so ensure that your Investment Portfolio credentials are filled as per the [last step](#3-configure-env-file).

To load a portfolio named `MyFixedIncomePortfolio`, first install dependencies and use the command-line with the script to create the portfolio:
```
npm install
node investmentPortfolio.js -l MyFixedIncomePortfolio
```

To load holdings from `holdings.sample.json` into `MyFixedIncomePortfolio`, run:
```
node investmentPortfolio.js -l MyFixedIncomePortfolio -h holdings.sample.json
```

Similarly you can view your portfolios by running:
```
node investmentPortfolio.js -g
```

and view holdings for portfolio:
```
node investmentPortfolio.js -g MyFixedIncomePortfolio
```


## 5. Run Application

cd into this project's root directory
+ Run `npm install` to install the app's dependencies
+ Run `node app.js`
+ Access the running app locally


## 6. Deploy to IBM Cloud

Edit the `manifest.yml` file in the folder that contains your code and replace with a unique name for your application. The name that you specify determines the application's URL, such as `your-application-name.mybluemix.net`. Additionally - update the service names so they match what you have in Bluemix. The relevant portion of the `manifest.yml` file looks like the following:

  ```none
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
    - Investment-Portfolio
    - Predictive-Market-Scenarios
    - Simulated-Instrument-Analytics
    - Arria-NLG-1
  ```

Once the manfiest.yml file is configured, you can push to IBM Cloud. From your root directory login into cf:
```
cf login
```
And push the app to IBM Cloud:
```
cf push
```

# Troubleshooting

* To troubleshoot your Bluemix application, use the logs. To see the logs, run:

```bash
cf logs <application-name> --recent
```

* If you are running locally - inspect your environment variables closely to confirm they match.  Try running each service as standalone:

```bash
python InvestmentPortfolio.py
python PredictiveMarketScenario.py
python SimulatedInstrumentAnalytics.py
```

# License

[Apache 2.0](LICENSE)
