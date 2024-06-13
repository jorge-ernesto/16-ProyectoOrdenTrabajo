/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N'],

    function (N) {

        const { log, runtime, record, search, url, email } = N;

        function getUser() {
            let user = runtime.getCurrentUser();
            return { user };
        }

        function error_log(title, data) {
            throw `${title} -- ${JSON.stringify(data)}`;
        }

        function error_message(message) {
            throw new Error(`${message}`);
        }

        /****************** Validacion ******************/

        function getCountrySubsidiary(subsidiaryId) {
            // Cargar el registro de la subsidiaria
            var subsidiaryRecord = record.load({
                type: record.Type.SUBSIDIARY,
                id: subsidiaryId
            });

            // Obtener el pais del registro de la subsidiaria
            var countrySubsidiary = subsidiaryRecord.getValue('country');

            return countrySubsidiary;
        }

        /****************** Records personalizados ******************/

        function getConfiguracionFlujoFirmas(subsidiaryId, workOrderTypeId) {

            // Crear un array para almacenar los valores
            var flujoFirmasArray = [];

            // Filtro de subsidiaria
            if (!subsidiaryId) {
                subsidiaryId = '@NONE@';
            }

            // Filtro de tipo de orden de trabajo
            if (!workOrderTypeId) {
                workOrderTypeId = '@NONE@';
            }

            // Crear una búsqueda para obtener los registros
            var searchObj = search.create({
                type: 'customrecord_bio_conf_ot_flufir',
                columns: [
                    'internalid',
                    'custrecord_bio_ot_flufir_subsidiaria',
                    'custrecord_bio_ot_flufir_tipo_ot',
                    'custrecord_bio_ot_flufir_centro_costo',
                    search.createColumn({
                        name: "custrecord_bio_ot_flufir_id_etapa",
                        sort: search.Sort.ASC,
                        label: "ID Etapa"
                    }),
                    'custrecord_bio_ot_flufir_desc_etapa',
                    // Campos a firmar
                    'custrecord_bio_ot_flufir_idcamusufir',
                    'custrecord_bio_ot_flufir_idcamfecfir',
                    // Botones para firmar
                    'custrecord_bio_ot_flufir_idbotfir',
                    'custrecord_bio_ot_flufir_nombotfir',
                    'custrecord_bio_ot_flufir_funbotfir',
                    // Botones para eliminar firmas
                    'custrecord_bio_ot_flufir_idbotelifir',
                    'custrecord_bio_ot_flufir_nombotelifir',
                    'custrecord_bio_ot_flufir_funbotelifir',
                ],
                filters: [
                    search.createFilter({
                        name: 'isinactive',
                        operator: search.Operator.IS,
                        values: 'F' // F para registros activos
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_flufir_subsidiaria',
                        operator: search.Operator.ANYOF,
                        values: subsidiaryId
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_flufir_tipo_ot',
                        operator: search.Operator.ANYOF,
                        values: workOrderTypeId
                    })
                ]
            });

            // Ejecutar la búsqueda y recorrer los resultados
            searchObj.run().each(function (result) {
                // Obtener informacion
                let { columns } = result;
                let flujo_firmas_id_interno = result.getValue(columns[0]);
                let subsidiaria_id_interno = result.getValue(columns[1]);
                let subsidiaria_nombre = result.getText(columns[1]);
                let tipo_ot_id_interno = result.getValue(columns[2]);
                let tipo_ot_nombre = result.getText(columns[2]);
                let centro_costo_id_interno = result.getValue(columns[3]);
                let centro_costo_nombre = result.getText(columns[3]);
                let id_etapa = result.getValue(columns[4]);
                let desc_etapa = result.getValue(columns[5]);
                let id_campo_usuario_firma = result.getValue(columns[6]);
                let id_campo_fecha_firma = result.getValue(columns[7]);
                let id_boton_firma = result.getValue(columns[8]);
                let nombre_boton_firma = result.getValue(columns[9]);
                let funcion_boton_firma = result.getValue(columns[10]);
                let id_boton_eliminar_firma = result.getValue(columns[11]);
                let nombre_boton_eliminar_firma = result.getValue(columns[12]);
                let funcion_boton_eliminar_firma = result.getValue(columns[13]);

                // Insertar informacion en array
                flujoFirmasArray.push({
                    flujo_firmas: { id_interno: flujo_firmas_id_interno },
                    subsidiaria: { id_interno: subsidiaria_id_interno, nombre: subsidiaria_nombre },
                    tipo_ot: { id_interno: tipo_ot_id_interno, nombre: tipo_ot_nombre },
                    centro_costo: { id_interno: centro_costo_id_interno, nombre: centro_costo_nombre },
                    id_etapa: id_etapa,
                    desc_etapa: desc_etapa,
                    id_campo_usuario_firma: id_campo_usuario_firma,
                    id_campo_fecha_firma: id_campo_fecha_firma,
                    id_boton_firma: id_boton_firma,
                    nombre_boton_firma: nombre_boton_firma,
                    funcion_boton_firma: funcion_boton_firma,
                    id_boton_eliminar_firma: id_boton_eliminar_firma,
                    nombre_boton_eliminar_firma: nombre_boton_eliminar_firma,
                    funcion_boton_eliminar_firma: funcion_boton_eliminar_firma
                });
                return true;
            });

            // error_log('getConfiguracionFlujoFirmas', flujoFirmasArray);
            return flujoFirmasArray;
        }

        function getConfiguracionEmpleadosPermisoFirmar(subsidiaryId, classId) {

            // Crear un array para almacenar los valores
            var empleadosArray = [];

            // Crear una búsqueda para obtener los registros
            var searchObj = search.create({
                type: 'customrecord_bio_conf_ot_emp',
                columns: [
                    'custrecord_bio_ot_emp_subsidiaria',
                    'custrecord_bio_ot_emp_centro_costo',
                    'custrecord_bio_ot_emp_empleado'
                ],
                filters: [
                    search.createFilter({
                        name: 'isinactive',
                        operator: search.Operator.IS,
                        values: 'F' // F para registros activos
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_emp_subsidiaria',
                        operator: search.Operator.ANYOF,
                        values: subsidiaryId
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_emp_centro_costo',
                        operator: search.Operator.ANYOF,
                        values: classId
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_emp_perm_firmar',
                        operator: search.Operator.IS,
                        values: 'T'
                    })
                ]
            });

            // Ejecutar la búsqueda y recorrer los resultados
            searchObj.run().each(function (result) {
                var empleadoValue = result.getValue('custrecord_bio_ot_emp_empleado');
                empleadosArray.push(Number(empleadoValue));
                return true;
            });

            return empleadosArray;
        }

        function getConfiguracionEmpleadosPermisoEliminar(subsidiaryId, classId) {

            // Crear un array para almacenar los valores
            var empleadosArray = [];

            // Crear una búsqueda para obtener los registros
            var searchObj = search.create({
                type: 'customrecord_bio_conf_ot_emp',
                columns: [
                    'custrecord_bio_ot_emp_subsidiaria',
                    'custrecord_bio_ot_emp_centro_costo',
                    'custrecord_bio_ot_emp_empleado'
                ],
                filters: [
                    search.createFilter({
                        name: 'isinactive',
                        operator: search.Operator.IS,
                        values: 'F' // F para registros activos
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_emp_subsidiaria',
                        operator: search.Operator.ANYOF,
                        values: subsidiaryId
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_emp_centro_costo',
                        operator: search.Operator.ANYOF,
                        values: classId
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_emp_perm_eliminar_fir',
                        operator: search.Operator.IS,
                        values: 'T'
                    })
                ]
            });

            // Ejecutar la búsqueda y recorrer los resultados
            searchObj.run().each(function (result) {
                var empleadoValue = result.getValue('custrecord_bio_ot_emp_empleado');
                empleadosArray.push(Number(empleadoValue));
                return true;
            });

            return empleadosArray;
        }

        function getConfiguracionUnidadMedida(subsidiaryId) {

            // Crear un array para almacenar los valores
            var configuracionUnidadMedidaArray = [];

            // Filtro de subsidiaria
            if (!subsidiaryId) {
                subsidiaryId = '@NONE@';
            }

            // Crear una búsqueda para obtener los registros
            var searchObj = search.create({
                type: 'customrecord_bio_conf_ot_unimed',
                columns: [
                    'internalid',
                    'custrecord_bio_ot_unimed_subsidiaria',
                    search.createColumn({
                        name: "custrecord_bio_ot_unimed_id_unidad",
                        sort: search.Sort.ASC,
                        label: "ID Unidad"
                    }),
                    'custrecord_bio_ot_unimed_redhacarr',
                ],
                filters: [
                    search.createFilter({
                        name: 'isinactive',
                        operator: search.Operator.IS,
                        values: 'F' // F para registros activos
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_unimed_subsidiaria',
                        operator: search.Operator.ANYOF,
                        values: subsidiaryId
                    })
                ]
            });

            // Ejecutar la búsqueda y recorrer los resultados
            searchObj.run().each(function (result) {
                // Obtener informacion
                let { columns } = result;
                let configuracion_unidad_medida_id_interno = result.getValue(columns[0]);
                let subsidiaria_id_interno = result.getValue(columns[1]);
                let subsidiaria_nombre = result.getText(columns[1]);
                let id_unidad = result.getValue(columns[2]);
                let redondear_hacia_arriba = result.getValue(columns[3]);

                // Insertar informacion en array
                configuracionUnidadMedidaArray.push({
                    configuracion_unidad_medida: { id_interno: configuracion_unidad_medida_id_interno },
                    subsidiaria: { id_interno: subsidiaria_id_interno, nombre: subsidiaria_nombre },
                    id_unidad: id_unidad,
                    redondear_hacia_arriba: redondear_hacia_arriba
                });
                return true;
            });

            /******************/

            // Obtener data en formato agrupado
            let dataAgrupada = {}; // * Audit: Util, manejo de JSON

            configuracionUnidadMedidaArray.forEach(element => {

                // Obtener variables
                let id_unidad = element.id_unidad

                // Agrupar data
                dataAgrupada[id_unidad] = dataAgrupada[id_unidad] || {};
                dataAgrupada[id_unidad] = element;

                // Otra forma
                // dataAgrupada[id_unidad] ??= [];
                // dataAgrupada[id_unidad] = element;
            });

            // error_log('getConfiguracionUnidadMedida', { configuracionUnidadMedidaArray, dataAgrupada } );
            return dataAgrupada;
        }

        /**
         * Configuración de Empleados y Permisos.
         *
         * Esta función obtiene los empleados que tienen permisos específicos en una subsidiaria.
         *
         * @param {string} subsidiaryId - ID de la subsidiaria.
         * @param {string} perm - Permiso a verificar, solo se aceptan "guardar" y "campo_cantidad_lista_materiales_inicial".
         * @returns {Array} empleadosArray - Array que contiene los ID de los empleados con los permisos especificados.
         */
        function getConfiguracionEmpleadosPermisos(subsidiaryId, perm) {

            // Crear un array para almacenar los valores
            var empleadosArray = [];

            // Filtro de permiso
            if (perm == 'guardar')
                permFieldName = 'custrecord_bio_ot_perm_permguardar';
            else if (perm == 'campo_cantidad_lista_materiales_inicial')
                permFieldName = 'custrecord_bio_ot_perm_permcamclmi'

            // Crear una búsqueda para obtener los registros
            var searchObj = search.create({
                type: 'customrecord_bio_conf_ot_perm',
                columns: [
                    'custrecord_bio_ot_perm_subsidiaria',
                    'custrecord_bio_ot_perm_empleado'
                ],
                filters: [
                    search.createFilter({
                        name: 'isinactive',
                        operator: search.Operator.IS,
                        values: 'F' // F para registros activos
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_perm_subsidiaria',
                        operator: search.Operator.ANYOF,
                        values: subsidiaryId
                    }),
                    search.createFilter({
                        name: permFieldName,
                        operator: search.Operator.IS,
                        values: 'T'
                    })
                ]
            });

            // Ejecutar la búsqueda y recorrer los resultados
            searchObj.run().each(function (result) {
                var empleadoValue = result.getValue('custrecord_bio_ot_perm_empleado');
                empleadosArray.push(Number(empleadoValue));
                return true;
            });

            return empleadosArray;
        }

        /****************** Data ******************/

        function getCabeceraOrdenTrabajo(workOrderId) {

            // Crear un array para almacenar los valores
            let cabeceraOrdenTrabajoArray = {};

            // Filtro de subsidiaria
            if (!workOrderId) {
                workOrderId = '@NONE@';
            }

            // Crear una búsqueda para obtener los registros
            let searchObj = search.create({
                type: 'workorder',
                columns: [
                    search.createColumn({ name: "internalid", label: "ID interno" }),
                    search.createColumn({ name: "custbody8", label: "BIO_CAM_TIPO_ORDEN_DE_TRABAJO" }),
                    search.createColumn({ name: "item", label: "Artículo" }),
                    search.createColumn({
                        name: "itemid",
                        join: "item",
                        label: "Nombre"
                    }),
                    search.createColumn({
                        name: "displayname",
                        join: "item",
                        label: "Nombre para mostrar"
                    }),
                    search.createColumn({ name: "tranid", label: "Número de documento" }),
                    search.createColumn({ name: "quantity", label: "Cantidad" }),
                    search.createColumn({ name: "unit", label: "Unidades" }),
                    search.createColumn({ name: "trandate", label: "Fecha" }),
                    search.createColumn({ name: "custbodybio_cam_lote", label: "LOTE" }),
                    search.createColumn({ name: "custbody126", label: "BIO_CAM_FECHA_INICIO_PRODUCCION_OT" }),
                    search.createColumn({ name: "custbodybio_cam_fechacaducidad", label: "BIO_CAM_OP_FECHA_CADUCIDAD" }),
                    search.createColumn({ name: "custbody41", label: "BIO_CAM_LINEA_PRODUCTO_OP" }),
                    search.createColumn({ name: "memo", label: "Nota" }),
                    search.createColumn({
                        name: "internalid",
                        join: "bomRevision",
                        label: "ID interno"
                    }),
                    search.createColumn({ name: "subsidiary", label: "Subsidiaria" }),
                    search.createColumn({ name: "custbody67", label: "BIO_CAM_EMITIDO_OT" }),
                    search.createColumn({ name: "custbody71", label: "BIO_CAM_FECHA_FIRMA_EMITIDO_OT" }),
                    search.createColumn({ name: "custbody69", label: "BIO_CAM_REVISADO_ALMACEN_OT" }),
                    search.createColumn({ name: "custbody72", label: "BIO_CAM_FECHA_FIRMA_ALMACEN_OT" }),
                    search.createColumn({ name: "custbody68", label: "BIO_CAM_REVISADO_ASEGURAMIENTO_OT" }),
                    search.createColumn({ name: "custbody74", label: "BIO_CAM_FECHA_FIRMA_ASEGURAMIENTO_OT" }),
                    search.createColumn({ name: "custbody80", label: "BIO_CAM_OP_EMITIDO_ID" }),
                    search.createColumn({ name: "custbody105", label: "BIO_CAM_FECHA_FIRMA_EMITIDO_OT_P" }),
                    search.createColumn({ name: "custbody69", label: "BIO_CAM_REVISADO_ALMACEN_OT" }),
                    search.createColumn({ name: "custbody106", label: "BIO_CAM_FECHA_FIRMA_REVISADO_OT_P" }),
                    search.createColumn({ name: "custbody103", label: "BIO_CAM_APROBADO_OT" }),
                    search.createColumn({ name: "custbody107", label: "BIO_CAM_FECHA_FIRMA_APROBADO_OT_P" }),
                    search.createColumn({ name: "custbody104", label: "BIO_CAM_RECIBIDO_OT" }),
                    search.createColumn({ name: "custbody108", label: "BIO_CAM_FECHA_FIRMA_RECIBIDO_OT_P" })
                ],
                filters: [
                    ["mainline", "is", "T"],
                    "AND",
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["internalid", "anyof", workOrderId]
                ]
            });

            // Ejecutar la búsqueda y recorrer los resultados
            searchObj.run().each(function (result) {
                // Obtener informacion
                let { columns } = result;

                // Tipo de orden de trabajo
                let tipo_ot = result.getValue(columns[1]);
                let tipo_ot_nombre = result.getText(columns[1]);

                // Data
                // Cabecera
                let assemblyitem_id = result.getValue(columns[2]);
                let numero_ot = result.getValue(columns[5]);
                let cantidad = result.getValue(columns[6]);
                let unidades = result.getValue(columns[7]);
                let cantidad_producir = result.getValue(columns[6]) + ' ' + result.getValue(columns[7]);
                let fecha_registro = result.getValue(columns[8]);
                let lote = result.getValue(columns[9]);
                let fecha_fabricacion = result.getValue(columns[10]);
                let fecha_expira = result.getValue(columns[11]);
                let linea = result.getValue(columns[12]);
                let observaciones = result.getValue(columns[13]);
                // Detalle
                let bomrevision_id = result.getValue(columns[14]);
                let subsidiary_id = result.getValue(columns[15]);
                // Firmas OTs que inicia Logística
                let emitido_por = result.getText(columns[16]);
                let fecha_firma_emitido = result.getValue(columns[17]);
                let ajustado_por_almacen = result.getText(columns[18]);
                let fecha_firma_almacen = result.getValue(columns[19]);
                let verificado_por_aseguramiento = result.getText(columns[20]);
                let fecha_firma_aseguramiento = result.getValue(columns[21]);
                // Firmas OTs que inicia Investigación y Desarrollo
                let emitido_por__id = result.getText(columns[22]);
                let fecha_firma_emitido__id = result.getValue(columns[23]);
                let revisado_por__id = result.getText(columns[24]);
                let fecha_firma_revisado__id = result.getValue(columns[25]);
                let aprobado_por__id = result.getText(columns[26]);
                let fecha_firma_aprobado__id = result.getValue(columns[27]);
                let recibido_por__id = result.getText(columns[28]);
                let fecha_firma_recibido__id = result.getValue(columns[29]);

                // Insertar informacion en json
                cabeceraOrdenTrabajoArray = {
                    // Tipo de orden de trabajo
                    tipo_ot: tipo_ot,
                    tipo_ot_nombre: tipo_ot_nombre,

                    // Data
                    // Cabecera
                    assemblyitem_id: assemblyitem_id,
                    numero_ot: numero_ot,
                    cantidad: cantidad,
                    unidades: unidades,
                    cantidad_producir: cantidad_producir,
                    fecha_registro: fecha_registro,
                    lote: lote,
                    fecha_fabricacion: fecha_fabricacion,
                    fecha_expira: fecha_expira,
                    linea: linea,
                    observaciones: observaciones,
                    // Detalle
                    bomrevision_id: bomrevision_id,
                    subsidiary_id: subsidiary_id,
                    // Firmas OTs que inicia Logística
                    emitido_por: emitido_por,
                    fecha_firma_emitido: fecha_firma_emitido,
                    ajustado_por_almacen: ajustado_por_almacen,
                    fecha_firma_almacen: fecha_firma_almacen,
                    verificado_por_aseguramiento: verificado_por_aseguramiento,
                    fecha_firma_aseguramiento: fecha_firma_aseguramiento,
                    // Firmas OTs que inicia Investigación y Desarrollo
                    emitido_por__id: emitido_por__id,
                    fecha_firma_emitido__id: fecha_firma_emitido__id,
                    revisado_por__id: revisado_por__id,
                    fecha_firma_revisado__id: fecha_firma_revisado__id,
                    aprobado_por__id: aprobado_por__id,
                    fecha_firma_aprobado__id: fecha_firma_aprobado__id,
                    recibido_por__id: recibido_por__id,
                    fecha_firma_recibido__id: fecha_firma_recibido__id
                }

                // Detener la búsqueda
                return false;
            });

            // error_log('cabeceraOrdenTrabajoArray', cabeceraOrdenTrabajoArray);
            return cabeceraOrdenTrabajoArray;
        }

        function getDetalleOrdenTrabajo(workOrderId) {

            // Crear un array para almacenar los valores
            let detalleOrdenTrabajoArray = [];

            // Filtro de subsidiaria
            if (!workOrderId) {
                workOrderId = '@NONE@';
            }

            // Crear una búsqueda para obtener los registros
            let searchObj = search.create({
                type: 'workorder',
                columns: [
                    search.createColumn({ name: "internalid", label: "ID interno" }),
                    search.createColumn({
                        name: "internalid",
                        join: "item",
                        label: "Artículo : ID interno"
                    }),
                    search.createColumn({
                        name: "itemid",
                        join: "item",
                        label: "Artículo : Nombre"
                    }),
                    search.createColumn({
                        name: "displayname",
                        join: "item",
                        label: "Artículo : Nombre para mostrar"
                    }),
                    search.createColumn({ name: "custcol_bio_cant_lis_mat_ini", label: "Cantidad de Lista de Materiales Inicial" }),
                    search.createColumn({ name: "quantity", label: "Cantidad" }),
                    search.createColumn({ name: "quantityuom", label: "Cantidad en unidades de la transacción" }),
                    search.createColumn({ name: "unitabbreviation", label: "Unidades" }),
                    /******************/
                    search.createColumn({ name: "componentyield", label: "Rendimiento de componentes" }),
                    search.createColumn({ name: "unitid", label: "ID de la unidad" })
                ],
                filters: [
                    ["mainline", "is", "F"],
                    "AND",
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["internalid", "anyof", workOrderId],
                    "AND",
                    ["unit", "noneof", "@NONE@"]
                ]
            });

            // Ejecutar la búsqueda y recorrer los resultados
            searchObj.run().each(function (result) {
                // Obtener informacion
                let { columns } = result;
                let orden_trabajo_id_interno = result.getValue(columns[0]);
                let articulo_id_interno = result.getValue(columns[1])
                let articulo_codigo = result.getValue(columns[2]);
                let articulo_descripcion = result.getValue(columns[3]);
                let cantidad_generada = result.getValue(columns[4]);
                // let cantidad_entregada = result.getValue(columns[5]); // quantity
                let cantidad_entregada = result.getValue(columns[6]); // quantityuom
                let unitabbreviation = result.getValue(columns[7]);
                /******************/
                let rendimiento_componentes = result.getValue(columns[8]);
                let unitid = result.getValue(columns[9]);

                // Procesar informacion
                // Informacion que se utiliza en el PDF - si no hay data, mostrara una cadena de texto vacia
                cantidad_generada = parseFloat(cantidad_generada) || '';
                cantidad_entregada = parseFloat(cantidad_entregada) || '';

                // Insertar informacion en array
                detalleOrdenTrabajoArray.push({
                    orden_trabajo: { id_interno: orden_trabajo_id_interno },
                    articulo: { id_interno: articulo_id_interno, codigo: articulo_codigo, descripcion: articulo_descripcion },
                    cantidad_generada,
                    cantidad_entregada,
                    unitabbreviation,
                    /******************/
                    rendimiento_componentes,
                    unitid
                });
                return true;
            });

            // error_log('getDetalleOrdenTrabajo', detalleOrdenTrabajoArray);
            return detalleOrdenTrabajoArray;
        }

        function getRevisionListaMateriales(bomRevisionId) {

            // Crear un array para almacenar los valores
            let revisionListaMaterialesArray = [];

            // Filtro de subsidiaria
            if (!bomRevisionId) {
                bomRevisionId = '@NONE@';
            }

            // Crear una búsqueda para obtener los registros
            let searchObj = search.create({
                type: 'bomrevision',
                columns: [
                    search.createColumn({
                        name: "internalid",
                        join: "component",
                        label: "Componente : ID interno"
                    }),
                    search.createColumn({
                        name: "item",
                        join: "component",
                        label: "Componente : Artículo"
                    }),
                    search.createColumn({
                        name: "bomquantity",
                        join: "component",
                        label: "Componente : Cantidad de BoM"
                    }),
                    search.createColumn({
                        name: "units",
                        join: "component",
                        label: "Componente : Unidades"
                    }),
                    search.createColumn({
                        name: "custrecord184",
                        join: "component",
                        label: "Componente : BIO_CAM_PRINCIPIO_ACTIVO (Personalizar)"
                    })
                ],
                filters: [
                    ["internalid", "anyof", bomRevisionId]
                ]
            });

            // Ejecutar la búsqueda y recorrer los resultados
            searchObj.run().each(function (result) {
                // Obtener informacion
                let { columns } = result;
                let revision_lista_materiales_id_interno = result.getValue(columns[0]);
                let articulo_id_interno = result.getValue(columns[1]);
                let articulo_codigo_descripcion = result.getText(columns[1]);
                let cantidad_bom = result.getValue(columns[2]);
                let units = result.getValue(columns[3]);
                let principio_activo = result.getValue(columns[4]);

                // Procesar informacion
                // Informacion que se utiliza en el PDF - si no hay data, mostrara una cadena de texto vacia
                cantidad_bom = parseFloat(cantidad_bom) || '';

                // Insertar informacion en array
                revisionListaMaterialesArray.push({
                    revision_lista_materiales: { id_interno: revision_lista_materiales_id_interno },
                    articulo: { id_interno: articulo_id_interno, codigo_descripcion: articulo_codigo_descripcion },
                    cantidad_bom,
                    units,
                    principio_activo
                });
                return true;
            });

            /******************/

            // Obtener data en formato agrupado
            let dataAgrupada = {}; // * Audit: Util, manejo de JSON

            revisionListaMaterialesArray.forEach(element => {

                // Obtener variables
                let articulo_id_interno = element.articulo.id_interno;

                // Agrupar data
                dataAgrupada[articulo_id_interno] = dataAgrupada[articulo_id_interno] || {};
                dataAgrupada[articulo_id_interno] = element;

                // Otra forma
                // dataAgrupada[articulo_id_interno] ??= [];
                // dataAgrupada[articulo_id_interno] = element;
            });

            // error_log('getRevisionListaMateriales', { revisionListaMaterialesArray, dataAgrupada } );
            return dataAgrupada;
        }

        function calculateCantidadListaMaterialesInicial(columnItem, columnComponentYield, columnUnits, quantity, arrayRevisionListaMateriales, arrayConfiguracionUnidadMedida) {

            // Debug
            // console.log('req calculateCantidadListaMaterialesInicial', { columnItem, columnComponentYield, columnUnits, quantity, arrayRevisionListaMateriales, arrayConfiguracionUnidadMedida })

            // Configuracion de decimales
            let fDecimal = 5;

            // Calcular la cantidad de lista de materiales inicial - redondeada a 5 decimales
            let cantidad_bom_ini = 0;
            let cantidad_bom = arrayRevisionListaMateriales?.[columnItem]?.['cantidad_bom'];
            let cantidad = quantity;
            let rend_comp = (columnComponentYield / 100);

            // Procesar informacion
            // Informacion que se utiliza para calcular la cantidad de lista de materiales inicial - si no hay data, lo tomara como 0
            cantidad_bom = parseFloat(cantidad_bom) || 0;
            cantidad = parseFloat(cantidad) || 0;
            rend_comp = parseFloat(rend_comp) || 0;

            if (rend_comp != 0) {
                cantidad_bom_ini = (cantidad_bom * cantidad) / rend_comp;
                cantidad_bom_ini = Math.round10(cantidad_bom_ini, -fDecimal);
            }

            // Calcular la cantidad de lista de materiales inicial - redondeada al entero más cercano hacia arriba
            if (arrayConfiguracionUnidadMedida?.[columnUnits]?.['redondear_hacia_arriba'] == true) {
                cantidad_bom_ini = Math.ceil(cantidad_bom_ini);
            } else {
                cantidad_bom_ini = cantidad_bom_ini;
            }

            // Debug
            // console.log('res calculateCantidadListaMaterialesInicial', { cantidad_bom_ini, cantidad_bom, cantidad, rend_comp })

            return cantidad_bom_ini;
        }

        function getDetalleOrdenTrabajo_cantLisMatIni(dataCabeceraOrdenTrabajo, dataDetalleOrdenTrabajo, dataRevisionListaMateriales, dataConfiguracionUnidadMedida) {

            // Debug
            // error_log('data', { dataCabeceraOrdenTrabajo, dataDetalleOrdenTrabajo, dataRevisionListaMateriales, dataConfiguracionUnidadMedida });

            let arrayRevisionListaMateriales = dataRevisionListaMateriales;
            let arrayConfiguracionUnidadMedida = dataConfiguracionUnidadMedida;

            dataDetalleOrdenTrabajo.forEach((value_detot, key_detot) => {

                let columnItem = value_detot.articulo.id_interno;
                let columnComponentYield = value_detot.rendimiento_componentes;
                let columnUnits = value_detot.unitid;

                // Validar data
                if (!value_detot.cantidad_generada) {

                    // Validar data
                    if (columnItem && columnComponentYield && columnUnits) {

                        // Obtener cantidad de lista de materiales inicial
                        let quantity = dataCabeceraOrdenTrabajo.cantidad;
                        let cant_lis_mat_ini = calculateCantidadListaMaterialesInicial(columnItem, columnComponentYield, columnUnits, quantity, arrayRevisionListaMateriales, arrayConfiguracionUnidadMedida);

                        // Setear cantidad de lista de materiales inicial
                        dataDetalleOrdenTrabajo[key_detot]['cantidad_generada'] = cant_lis_mat_ini;
                    }
                }
            });

            // Debug
            // error_log('data', { dataCabeceraOrdenTrabajo, dataDetalleOrdenTrabajo, dataRevisionListaMateriales, dataConfiguracionUnidadMedida });

            return dataDetalleOrdenTrabajo;
        }

        function getDetalleOrdenTrabajo_principioActivo(dataDetalleOrdenTrabajo, dataRevisionListaMateriales) {

            dataDetalleOrdenTrabajo.forEach((value_detot, key_detot) => {

                articulo_id_interno = value_detot.articulo.id_interno;
                dataDetalleOrdenTrabajo[key_detot]['principio_activo'] = false;

                if (dataRevisionListaMateriales?.[articulo_id_interno]?.principio_activo == true) {

                    // Obtener flag de principio activo
                    dataDetalleOrdenTrabajo[key_detot]['principio_activo'] = true;
                }
            });

            return dataDetalleOrdenTrabajo;
        }

        /****************** Helper ******************/

        function decimalAdjust(type, value, exp) {
            // Si el exp no está definido o es cero...
            if (typeof exp === 'undefined' || +exp === 0) {
                return Math[type](value);
            }
            value = +value;
            exp = +exp;
            // Si el valor no es un número o el exp no es un entero...
            if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
                return NaN;
            }
            // Shift
            value = value.toString().split('e');
            value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
            // Shift back
            value = value.toString().split('e');
            return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
        }

        // Decimal round
        if (!Math.round10) {
            Math.round10 = function (value, exp) {
                return decimalAdjust('round', value, exp);
            };
        }
        // Decimal floor
        if (!Math.floor10) {
            Math.floor10 = function (value, exp) {
                return decimalAdjust('floor', value, exp);
            };
        }
        // Decimal ceil
        if (!Math.ceil10) {
            Math.ceil10 = function (value, exp) {
                return decimalAdjust('ceil', value, exp);
            };
        }

        return {
            getUser,
            error_log,
            error_message,
            // Orden de Trabajo - Validacion
            getCountrySubsidiary,
            // Orden de Trabajo - Records personalizados
            getConfiguracionFlujoFirmas,
            getConfiguracionEmpleadosPermisoFirmar,
            getConfiguracionEmpleadosPermisoEliminar,
            getConfiguracionUnidadMedida,
            getConfiguracionEmpleadosPermisos,
            // Orden de Trabajo - Data
            getCabeceraOrdenTrabajo,
            getDetalleOrdenTrabajo,
            getRevisionListaMateriales,
            calculateCantidadListaMaterialesInicial,
            getDetalleOrdenTrabajo_cantLisMatIni,
            getDetalleOrdenTrabajo_principioActivo
        }

    });
