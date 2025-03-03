
/*
  TODO
    RANKING
      MOSTRAR RANKING
        AÑADIR SOLICITUD AMISTAD
    MENSAJES
      DESTINATARIO
        MOSTRAR AMIGOS
    AMISTADES
      MOSTAR AMISTADES
        ELIMINAR AMISTAD
      MOSTRAR SOLICITUDES
        ACEPTAR SOLICITUD
        RECHAZAR SOLICITUD


    AÑADIR GUARIDA
      cofre : minimo de oro que no te podran robar nunca
      almacen: aumenta los espacios del inventario
      entorno : reduce la posibilidad de recibir un ataque ( a la hora de que un 
      oponente busque enemigos tienes una posibilidad de no aparecer en su listado)
      trampas/alarmas :  reduce la posibilidad de recibir un robo.
      (a futuro añadire mesas de crafteo o cosas asi pero por ahora no)
      aguas termales?? : regeneracion de salud
      piedra de mana?? : regeneracion de mana ( no en este juego al menos...)
    
    AÑADIR EQUIPOS ( ACCESORIOS)
    AÑADIR CONSUMIBLES

    AÑADIR GREMIOS??
    
    AÑADIR ESTADOS?? 
*/
/*
  REGISTRO:
        BACK:
        FRONT:
          MEJORAR TODO
  CREACION DE PERSONAJE:
        BACK:
          CREACION DE PERSONAJE
        FRONT:
          LOGICA : Si un user hace login y no tiene personaje, un guard le redirecciona a creacion de personaje
          GUARD NOT_CHARACTER : Si user no tiene character redir createCharacterComponent
          GUARD HAS_CHARACTER : Aplicado solo para createCharacterComponent. Si user tiene character redir dashboard
          CREACION DE PERSONAJE COMPONENT : Rellenar nombre y clase, crear personaje y el guard lo llevara a dashboard, creo...
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
*/
/*
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
*/
/*
  COMBATES:
    LISTO:
        MOSTRAR LISTADO DE OPONENTES
        CONTROLAR ESTADO CHARACTER
        INICIAR COMBATE
        MOSTRAR RESULTADO COMBATE
        ACTUALIZAR RECOMPENSAS
    REVISAR:
        MOSTRAR RANKING
    PENDIENTE:
        FILTROS RANKING??
        AMISTAD??
*/
/*
  TIENDA:
    LISTO:
        MOSTRAR OBJETOS TIENDA
        PERMITIR COMPRAR

    PENDIENTE:    
      REVISAR APILAMIENTO OBJETOS
*/
/*
  MENSAJES:
    LISTO:
        MOSTRAR MENSAJES ENTRADA
        MOSTRAR MENSAJES SALIDA
        ENVIAR NUEVO MENSAJE

    PENDIENTE:
        REVSAR DUPLICADO ENTRANTES-SALIENTES
        REVISAR ELIMINACION.
*/
