SELECT @existe_base_de_datos := count(SCHEMA_NAME)
FROM INFORMATION_SCHEMA.SCHEMATA 
WHERE SCHEMA_NAME = 'Webflix';

IF @existe_base_de_datos = 0 THEN
  CREATE DATABASE Webflix;
END IF;

USE Webflix;

select @existe_tabla := count(TABLE_NAME) 
from INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'Clientes';

IF @existe_tabla = 0 THEN
    create table Clientes(
        id_cliente int  not null primary key,
        nombre varchar(50),
        apellido varchar(50),
        dni varchar(20),
        fechanac varchar(50),
        email varchar(50),
        contrasenia varchar(500),
        pais varchar(10)
);
END IF;

select @existe_tabla2 := count(TABLE_NAME) 
from INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'Planes';

IF @existe_tabla2 = 0 THEN
  create table Planes(
    id_plan int not null primary key,
    nombre_plan varchar(50),
    cant_dispositivos int,
    valor int
);
END IF;

select @existe_tabla3 := count(TABLE_NAME) 
from INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'Suscripciones';

IF @existe_tabla3 = 0 THEN
    create table Suscripciones(
        id_suscripcion int not null primary key,
        id_plan int,
        id_cliente int,
        fecha_vencimiento date,
        foreign key (id_plan) references Planes(id_plan),
        foreign key (id_cliente) references Clientes(id_cliente)
);
END IF;



select @existe_tabla4 := count(TABLE_NAME) 
from INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'Pagos';

IF @existe_tabla4 = 0 THEN
  create table Pagos(
    id_pago int primary key,
    id_suscripcion int,
    fecha_pago  date,
    monto int,
    foreign key (id_suscripcion) references Suscripciones(id_suscripcion)
);
END IF;
