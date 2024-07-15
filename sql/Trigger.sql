USE Webflix;
CREATE TRIGGER increment_by_one_clientes BEFORE INSERT ON Clientes
    FOR EACH ROW 
    SET NEW.id_cliente = (SELECT coalesce(MAX(id_cliente), 0) + 1 FROM Clientes);

CREATE TRIGGER increment_by_one_planes BEFORE INSERT ON Planes
    FOR EACH ROW 
    SET NEW.id_plan = (SELECT coalesce(MAX(id_plan), 0) + 1 FROM Planes);

CREATE TRIGGER increment_by_one_pagos BEFORE INSERT ON Pagos
    FOR EACH ROW 
    SET NEW.id_pago = (SELECT coalesce(MAX(id_pago), 0) + 1 FROM Pagos);

CREATE TRIGGER increment_by_one_suscripciones BEFORE INSERT ON Suscripciones
    FOR EACH ROW 
    SET NEW.id_suscripcion = (SELECT coalesce(MAX(id_suscripcion), 0) + 1 FROM Suscripciones);