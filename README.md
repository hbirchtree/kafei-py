# KafeiPy

This is the Kafei server for processing Coffee runtime reports

## SSL usage

For SSL, drop the dirname for a LetsEncrypt directory in the file `config`.
It should contain the following files:

    cert.pem
    fullchain.pem

The filenames above are set by start.sh, and instated using `SSL_CERT` and `SSL_KEY`.

## Basic usage

    KAFEI_DEBUG=[1|0] DBPASS=[Database password] ./start.sh


## What does it do

The resource `/reports` receives the reports through POST/PUT requests.

At `/`, there is basically nothing.
