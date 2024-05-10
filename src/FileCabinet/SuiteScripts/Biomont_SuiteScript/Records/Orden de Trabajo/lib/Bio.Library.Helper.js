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

        function getConfiguracionFlujoFirmas(subsidiaryId, wordOrderTypeId) {

            // Crear un array para almacenar los valores
            var flujoFirmasArray = [];

            // Filtro de subsidiaria
            if (!subsidiaryId) {
                subsidiaryId = '@NONE@';
            }

            // Filtro de tipo de orden de trabajo
            if (!wordOrderTypeId) {
                wordOrderTypeId = '@NONE@';
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
                        values: wordOrderTypeId
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

        function getDetalleOrdenTrabajo(wordOrderId) {

            // Crear un array para almacenar los valores
            let detalleOrdenTrabajoArray = [];

            // Filtro de subsidiaria
            if (!wordOrderId) {
                wordOrderId = '@NONE@';
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
                    search.createColumn({ name: "quantityuom", label: "Quantity in Transaction Units" }),
                    search.createColumn({ name: "unitabbreviation", label: "Unidades" })
                ],
                filters: [
                    ["mainline", "is", "F"],
                    "AND",
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["internalid", "anyof", wordOrderId],
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
                    unitabbreviation
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
            getDetalleOrdenTrabajo,
            getRevisionListaMateriales,
            getDetalleOrdenTrabajo_principioActivo
        }

    });
