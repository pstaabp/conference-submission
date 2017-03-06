package Dancer2::Plugin::Auth::Extensible::Provider::Local;

use Carp qw/croak/;
use Dancer2::Core::Types qw/ArrayRef/;
use List::Util qw/first/;
use Moo;
with "Dancer2::Plugin::Auth::Extensible::Role::Provider";
use namespace::clean;

our $VERSION = '0.703';

=head1 NAME

Dancer2::Plugin::Auth::Extensible::Provider::Config - example auth provider using app config


=head1 DESCRIPTION

This is a simple authentication provider which authenticates based on a list of
usernames, passwords (crypted, preferably - see below) and role specifications
provided in the realm definition in your app's config file.

This class is primarily intended as an example of what an authentication
provider class should do; however, if you just want simple user authentication
with user details stored in your app's config file, it may well suit your needs.

See L<Dancer2::Plugin::Auth::Extensible> for details on how to use the
authentication framework.

=head1 SYNOPSIS

In your app's C<config.yml>:

    plugins:
        Auth::Extensible:
            realms:
                config:
                    provider: Config
                    users:
                        - user: dave
                          pass: supersecret
                          roles:
                            - Developer
                            - Manager
                            - BeerDrinker
                        - user: bob
                          pass: '{SSHA}+2u1HpOU7ak6iBR6JlpICpAUvSpA/zBM'
                          roles:
                            - Tester

As you can see, you can define the usernames, passwords (please use crypted
passwords, RFC2307-style, not plain text (although plain text *is* supported,
but really not a good idea), and the roles for each user (if you're
not planning to use roles, omit the roles section from each user entirely).

=head1 ATTRIBUTES

=head2 users

Array reference containing users from configuration.

=cut

has users => (
    is       => 'ro',
    isa      => ArrayRef,
    required => 1,
);

=head1 METHODS

=head2 authenticate_user $username, $password

=cut


sub authenticate_user {
    my ($self, $username, $password) = @_;

    croak "username and password must be defined"
      unless defined $username && defined $password;

    my $user = first {
        $_->{user} eq $username
    } @{ $self->users };

    #my $user_details = $self->get_user_details($username) or return;
    return $self->match_password($password, $user->{pass});
}

=head2 get_user_details $username

=cut

# Just return the whole user definition from the config; this way any additional
# fields defined for users will just get passed through.
sub get_user_details {
    my ($self, $username) = @_;

    croak "username must be defined" unless defined $username;

    my $config = $self->plugin->app->config;

    my $client = MongoDB->connect('mongodb://localhost');
    my $collection = $client->ns($config->{database_name} . ".users");
    my $user = $collection->find_one({falconkey => $username});
    $user->{_id} = $user->{_id}->{value} if defined($user);
    return $user if defined($user);

    ## first look for the user in the envinroment config.
    my $users = $config->{plugins}->{"Auth::Extensible"}->{realms}->{local}->{users};
    $user = first {$_->{falconkey} eq $username } @$users;
    return $user if defined($user);

    $user = first {
        $_->{user} eq $username
    } @{ $self->users };
    my $details = {};
    my @fields = qw/first_name last_name falconkey role/;
    for my $key (@fields){
      $details->{$key} = $user->{$key};
    }
    return $details;
}

=head2 get_user_roles $username

=cut

sub get_user_roles {
    my ($self, $username) = @_;

    croak "username must be defined" unless defined $username;
    my $user_details = $self->get_user_details($username) or return;
    return $user_details->{role};
}

1;
