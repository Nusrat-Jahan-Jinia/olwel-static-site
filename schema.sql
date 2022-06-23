create table doctor_applications (
    id int not null auto_increment,
    name varchar(60) not null,
    phone varchar(20) not null,
    email varchar(40),
    present_address varchar(40),
    permanent_address varchar(40),
    mbbs_year varchar(4),
    mbbs_institute varchar(40),
    current_course_name varchar(40),
    current_course_institute varchar(40),
    bmdc_reg_number varchar(10),
    experience_1 varchar(100),
    experience_2 varchar(100),
    experience_3 varchar(100),
    int_cc tinyint(1),
    int_hv tinyint(1),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp null on update current_timestamp,
    primary key (id)
);

create table contact_requests (
    id int not null auto_increment,
    name varchar(60) not null,
    phone varchar(20) not null,
    email varchar(40),
    interest varchar(40),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp null on update current_timestamp,
    primary key (id)
);
