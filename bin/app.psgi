#!/usr/bin/env perl

use strict;
use warnings;
use FindBin;
use lib "$FindBin::Bin/../lib";

use Routes::Templates;
use Routes::API;
use Plack::Builder;

#BEGIN { $ENV{'PLACK_ENV'} = 'production'; }

builder {
    mount '/'    => Routes::Templates->to_app;
    mount '/api' => Routes::API->to_app;
};
