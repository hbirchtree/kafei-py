# KafeiPy

This is the Kafei server for processing Coffee runtime reports

## SSL usage

Most of the SSL configuration is defined in docker-compose.yml, pointing to a LetsEncrypt directory.
You must change these if you wish to use this differently.

## Basic usage

The following command will start Nginx on port 80 and 443 (80 redirecting to 443 for encryption) and an isolated instance of PostgreSQL.

The Kafei server is the only entrypoint to the PostgreSQL server from the outside, as they are in the same virtual network.

    docker-compose up

## What does it do

The following interfaces are exposed:

 - coffee.birchtrees.me/
   - docs/
     Coffeecutie documentation, updated with every push to master branch.
   - hook
     Hook for the above interface, only for GitHub to access
   - api/
     Interface for submitting runtime reports by Coffeecutie applications
     - v1/
       - reports/
         A POST-only interface that allows submission of system information.
       - runs/
         A GET-only interface for all runs submitted, parameterized with `page` and `count`
       - devices/
         A GET-only interface for all devices by all runs submitted
       - processors/
         A GET-only interface for all processors by all runs submitted
       - statistics/
         A GET-only interface to various statistics collected, like architectures and etc.
       - / and api/
         Just a little jape
   - reports/
     Redirects to api/v1/reports

 - birchtrees.me
   Just a redirect
