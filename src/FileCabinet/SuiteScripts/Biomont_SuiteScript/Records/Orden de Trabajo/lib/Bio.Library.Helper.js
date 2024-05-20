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

        /******************/

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

        /******************/

        function getFlujoFirmas(subsidiariaId, tipoOtId) {

            // Crear un array para almacenar los valores
            var flujoFirmasArray = [];

            // Filtro de subsidiaria
            if (!subsidiariaId) {
                subsidiariaId = '@NONE@';
            }

            // Filtro de tipo de orden de trabajo
            if (!tipoOtId) {
                tipoOtId = '@NONE@';
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
                        values: subsidiariaId
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_flufir_tipo_ot',
                        operator: search.Operator.ANYOF,
                        values: tipoOtId
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
                    flujo_firmas_id_interno: { id_interno: flujo_firmas_id_interno },
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

            // error_log('getFlujoFirmas', flujoFirmasArray);
            return flujoFirmasArray;
        }

        function getEmpleadosPermisoFirmar(subsidiariaId, centroCostoId) {

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
                        values: subsidiariaId
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_emp_centro_costo',
                        operator: search.Operator.ANYOF,
                        values: centroCostoId
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

        function getEmpleadosPermisoEliminar(subsidiariaId, centroCostoId) {

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
                        values: subsidiariaId
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_emp_centro_costo',
                        operator: search.Operator.ANYOF,
                        values: centroCostoId
                    }),
                    search.createFilter({
                        name: 'custrecord_bio_ot_emp_perm_eliminar',
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

        return {
            getUser,
            error_log,
            error_message,
            // Orden de Trabajo
            getCountrySubsidiary,
            getFlujoFirmas,
            getEmpleadosPermisoFirmar,
            getEmpleadosPermisoEliminar
        }

    });
