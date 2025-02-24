/*
PARA AÑADIR:
    DATABASE.TS
        db.run(`
            CREATE TABLE IF NOT EXISTS friendship (
            idUser1 INTEGER NOT NULL,
            idUser2 INTEGER NOT NULL,
            state INTEGER DEFAULT 0
            FOREIGN KEY (idUser1) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (idUser2) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        


REVISION:
    FRONT:
        PERFIL:
            LISTO:
                MOSTRAR DATOS PRINCIPALES
                MOSTRAR ATRIBUTOS
                MOSTRAR UPGRADE
                UPGRADE ATRIBUTOS
                MOSTRAR EQUIPO
                MOSTRAR INVENTARIO
            PENDIENTE:
                MOSTRAR ESTADISTICAS??
                MOSTRAR PARAMETROS EXTRA
                REVISAR EQUIPAR - DESEQUIPAR.
                MOSTRAR ATRIBUTOS COMBINADOS.
                AÑADIR TALENTOS??
                AÑADIR ORBES ("Modo historia mod parametros segun respuestas")

        ACTIVIDADES:
            LISTO:
                MOSTRAR LISTADO DE ACTIVIDADES
                MOSTRAR DURACION MAXIMA
                INICIAR ACTIVIDAD
                CONTROLAR NO INICIAR SI HAY ACTIVIDAD
                CONTROLAR DURACION MAXIMA
                COMPLETAR ACTIVIDAD
                    RECOMPENSA ACTIVIDAD
                
            REVISAR:
                CONTROLAR NO INICIAR ESTADO CHARACTER

        COMBATES:
            LISTO:
                MOSTRAR LISTADO DE OPONENTES
                CONTROLAR ESTADO CHARACTER
                INICIAR COMBATE
                MOSTRAR RESULTADO COMBATE
                ACTUALIZAR RECOMPENSAS
            PENDIENTE:
                MOSTRAR RANKING
                FILTROS RANKING??
                AMISTAD??

        TIENDA:
            LISTO:
                MOSTRAR OBJETOS TIENDA
                PERMITIR COMPRAR

            PENDIENTE:    
                CORREGIR MOSTRAR INVENTARIO.
                REVISAR COMPRA - VENTA.
                    REVISAR APILAMIENTO OBJETOS
                REVISAR ACTUALIZACION WEBSOCKET.

        MENSAJES:
            LISTO:
                MOSTRAR MENSAJES ENTRADA
                MOSTRAR MENSAJES SALIDA
                ENVIAR NUEVO MENSAJE

            PENDIENTE:
                REVSAR DUPLICADO ENTRANTES-SALIENTES
                REVISAR ELIMINACION.
        
        ATRIBUTOS:
            REVISAR ATRIBUTOS COMBINADOS PERFIL Y COMBATE

        TODO:
            AÑADIR AMISTAD
            AÑADIR GUARIDA
            AÑADIR EQUIPOS ( ARMADURAS ACCESORIOS)
            AÑADIR CONSUMIBLES
            AÑADIR CREACION PERSONAJE ( NOMBRE - CLASE)
            AÑADIR GREMIOS??
            AÑADIR ESTADOS?? 













*/