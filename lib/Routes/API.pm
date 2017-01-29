package Routes::API;
use Dancer2;
set serializer => 'JSON';
use MongoDB;
use MongoDB::OID;
# use Model::Author;
# use Model::Module;
# use Model::Problem;
# use Model::ProblemSet;
# use Model::ModuleList qw/module_collection/;
# use Model::ProblemList qw/problem_collection get_problem_by_id update_problem_by_id/;
use Common::Collection qw/to_hashes get_one_by_id get_all_in_collection/;
use Data::Dump qw/dump/;
use Types::Standard qw/ArrayRef Str/;

### User Routes

get '/users' => sub { # get all users
    my $client = MongoDB->connect('mongodb://localhost');
    my $problems = problem_collection($client);
    return to_hashes($problems);


};


post '/users' => sub { # add a new author

  my $new_user = Model::User->new(body_parameters->as_hashref);
  my $client = MongoDB->connect('mongodb://localhost');
  my $authors = $client->ns('problemdb.authors');

  #debug $authors;
  my $result = $authors->insert_one($new_user);

  debug $result;

  return {msg => "hi"};
};

### problem routes

post '/problems/:problem_id/latex' => sub {
    my $client = MongoDB->connect('mongodb://localhost');
    my $prob = get_problem_by_id($client,route_parameters->{problem_id});

    if($prob->language eq 'markdown') {
      $prob->md_to_latex;
    } else {
      $prob->latex_to_md;
    }

   return {msg => "hi"};
};

get '/problems' => sub { # get an array of all modules
    my $client = MongoDB->connect('mongodb://localhost');
    my $problems = problem_collection($client);
    return to_hashes($problems);
};

###
#  get a single problem with id :problem_id
#
#  return a hash of the problem.
###


get '/problems/:problem_id' => sub {
   debug 'in /problems/:problem_id';
   my $client = MongoDB->connect('mongodb://localhost');
   my $prob = get_one_by_id($client,'problemdb.problems','Model::Problem',route_parameters->{problem_id});
   return $prob->to_hash;
};

put '/problems/:problem_id' => sub {
   my $client = MongoDB->connect('mongodb://localhost');
   my $prob = Model::ProblemList::update_problem_by_id($client,route_parameters->{problem_id},body_parameters->as_hashref);
   return $prob->to_hash;
};

del '/problems/:problem_id' => sub {
   my $client = MongoDB->connect('mongodb://localhost');
   my $prob = Model::ProblemList::remove_problem_by_id($client,route_parameters->{problem_id});
   return $prob;
};


post '/problems' => sub { # add a problem.

  #debug "in post /problems";
  my $client = MongoDB->connect('mongodb://localhost');
  debug dump body_parameters->mixed;
  debug ref body_parameters->as_hashref_mixed->{type};
  my $type = ArrayRef[Str];

  #print "testing: " . $type->(body_parameters->mixed->{type}) . "\n";
  my $problem = Model::ProblemList::insert_new_problem($client,body_parameters->as_hashref_mixed);

  return $problem->to_hash;
};

post '/problems/latex' => sub {
  debug "in post /problems/latex";
  my $client = MongoDB->connect('mongodb://localhost');
  my $problems = problem_collection($client);

  my $s = "";

  for my $prob (@{$problems}) {
    $s .= "\\item " . $prob->get_latex;
  }

  #my $output_dir= '/Users/pstaab/Transporter/peter/code/problemdb/public/output';
  my $output_dir = config->{appdir} . "/public/output";

  # some useful options (see below for full list)
  my $config = {
      INCLUDE_PATH => config->{appdir} . '/views',  # or list ref
      OUTPUT_PATH  => $output_dir,
      INTERPOLATE  => 1,               # expand "$var" in plain text
      POST_CHOMP   => 1,               # cleanup whitespace
     # PRE_PROCESS  => 'header',        # prefix each template
      EVAL_PERL    => 1,               # evaluate Perl code blocks
  };

  # create Template object
  my $template = Template->new($config);

  my $input = "latex_template.tex";
  my $out = "test.tex";
  $template->process($input,{CONTENT=>$s},$out);

  my $latex_out = system('/Library/TeX/texbin/pdflatex',"-output-directory=$output_dir","$output_dir/test.tex");

  debug $!;

  return {msg => $latex_out};

};

### problem set routes

get '/problemsets' => sub {
  my $client = MongoDB->connect('mongodb://localhost');
  my $sets = get_all_in_collection($client,'problemdb.problemsets','Model::ProblemSet');

  return to_hashes($sets);
};


post '/problemsets' => sub {
  my $newProblemSet = Model::ProblemSet->new(body_parameters->as_hashref);
  $newProblemSet->insert_to_db(MongoDB->connect('mongodb://localhost'));

  return $newProblemSet->to_hash;
};

get '/problemsets/:set_id' => sub {
  debug "in GET /problemsets/:set_id";
  my $client = MongoDB->connect('mongodb://localhost');
  my $set = get_one_by_id($client,"problemdb.problemsets","Model::ProblemSet",route_parameters->{set_id});

  return $set->to_hash;
};


put '/problemsets/:set_id' => sub {
  debug "in PUT /problems/:set_id";
  my $client = MongoDB->connect('mongodb://localhost');
  my $set = get_one_by_id($client,"problemdb.problemsets","Model::ProblemSet",route_parameters->{set_id});
  my @problems =  body_parameters->get_all("problems");
  $set->name(body_parameters->{name});
  $set->institution(body_parameters->{institution});
  $set->instructor(body_parameters->{instructor});
  $set->date(body_parameters->{date});
  $set->header(body_parameters->{header});
  $set->course_name(body_parameters->{course_name});
  $set->problems(\@problems);
  $set->update_in_db($client,"problemdb.problemsets");

  return $set->to_hash;
};

del '/problemsets/:set_id' => sub {
   debug "in DEL /problemsets/:set_id";
   my $client = MongoDB->connect('mongodb://localhost');
   my $set = get_one_by_id($client,"problemdb.problemsets","Model::ProblemSet",route_parameters->{set_id});
   debug dump $set;
   #my $set = Model::ProblemSet->new(route_parameters->as_hashref);
   return $set->remove_from_db($client);
};


### latex a give problem set

post '/problemsets/:set_id/latex' => sub {
  debug 'in POST /problemsets/:set_id/latex';
  my $client = MongoDB->connect('mongodb://localhost');
  my $set = get_one_by_id($client,"problemdb.problemsets","Model::ProblemSet",route_parameters->{set_id});
  return $set->latex($client,config,query_parameters->{solution});

};


### module routes

get '/modules' => sub { # get an array of all modules
    my $client = MongoDB->connect('mongodb://localhost');
    my $modules = module_collection($client);
    return to_hashes($modules);
};

get '/module' => sub {
  my $client = MongoDB->connect('mongodb://localhost');
  my $mc = $client->ns('problemdb.modules');

  my $mod = $mc->find_one;

  my $mod2 = Model::Module->new($mod);
  return $mod2->to_hash;

};

post '/modules' => sub { # add a module
  my $newModule = Model::Module->new(body_parameters->as_hashref);
  $newModule->insert_to_db(MongoDB->connect('mongodb://localhost'));

  return $newModule->to_hash;
};


put '/modules/:module_id' => sub {
  debug "in put /modules/:module_id";
  my $module_id = MongoDB::OID->new(route_parameters->{module_id});
  my $client = MongoDB->connect('mongodb://localhost');
  my $module_collection = $client->ns('problemdb.modules');
  debug body_parameters;
  my $updated_module = $module_collection->find_one_and_update({_id => $module_id},{name => body_parameters->{name}});

  return {name => body_parameters->{name}};

};

del '/modules/:module_id' => sub {
  debug "in /modules/:module_id";
  my $module_id = MongoDB::OID->new(route_parameters->{module_id});
  my $client = MongoDB->connect('mongodb://localhost');
  my $module_collection = $client->ns('problemdb.modules');
  debug route_parameters->{module_id};
  my $module_to_delete = $module_collection->delete_one({_id => $module_id});

  debug $module_to_delete;

  return {success => true};

};



true;
