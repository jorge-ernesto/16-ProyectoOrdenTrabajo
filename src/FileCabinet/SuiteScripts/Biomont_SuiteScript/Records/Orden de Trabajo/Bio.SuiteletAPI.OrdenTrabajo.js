// Notas del archivo:
// - Secuencia de comando:
//      - Biomont SL API Orden Trabajo (customscript_bio_sl_api_orden_trabajo)

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['./lib/Bio.Library.Helper', 'N'],

    function (objHelper, N) {

        const { log, record, runtime, format, url } = N;

        /******************/

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        function onRequest(scriptContext) {
            // Debug
            // scriptContext.response.setHeader('Content-type', 'application/json');
            // scriptContext.response.write(JSON.stringify(scriptContext));
            // return;

            // Debug
            // log.debug('method', scriptContext.request.method);
            // log.debug('parameters', scriptContext.request.parameters);
            // log.debug('body', scriptContext.body);
            // return;

            if (scriptContext.request.method == 'POST') {

                // Obtener datos enviados por peticion HTTP
                let data = JSON.parse(scriptContext.request.body);
                let method = data._method || null;

                if (method) {

                    // Obtener datos
                    let workorder_id = data._workorder_id || null;
                    let id_campo_usuario_firma = data._id_campo_usuario_firma || null;
                    let id_campo_fecha_firma = data._id_campo_fecha_firma || null;
                    let id_revision_lista_materiales = data._id_revision_lista_materiales || null;
                    let id_subsidiaria = data._id_subsidiaria || null;
                    let perm = data._perm || null;

                    // Obtener el record de la Orden de Trabajo
                    let workorderRecord = workorder_id ? record.load({ type: 'workorder', id: workorder_id }) : null;

                    // Obtener el usuario logueado
                    let user = runtime.getCurrentUser();

                    // Obtener fecha y hora actual
                    var now = new Date();
                    var datetime = format.format({ value: now, type: format.Type.DATETIME });

                    // Respuesta
                    let response = {
                        code: '400',
                        status: 'error',
                        method: method
                    };

                    // El control de errores comienza aca para tener acceso a method y response
                    try {
                        // Debug
                        // objHelper.error_log('test err', response);

                        if (method == 'getDataConfiguracionFlujoFirmas' && workorderRecord) {

                            // Obtener datos
                            let subsidiariaId = workorderRecord.getValue('subsidiary');
                            let tipoOtId = workorderRecord.getValue('custbody8');
                            let arrayFlujoFirmas = objHelper.getConfiguracionFlujoFirmas(subsidiariaId, tipoOtId);

                            // Validar que encontro flujo de firmas
                            if (arrayFlujoFirmas) {

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    workorderRecord: workorderRecord,
                                    arrayFlujoFirmas: arrayFlujoFirmas
                                };
                            }
                        } else if (method == 'firmar' && workorderRecord) {

                            // Setear datos al record
                            workorderRecord.setValue(id_campo_usuario_firma, user.id);
                            workorderRecord.setValue(id_campo_fecha_firma, datetime);
                            let workorderId = workorderRecord.save();
                            log.debug('', workorderId);

                            if (workorderId) {
                                // Obtener url del Record
                                let urlRecord = url.resolveRecord({
                                    recordType: 'workorder',
                                    recordId: workorder_id,
                                    params: {
                                        _status: 'PROCESS_SIGNATURE'
                                    }
                                })

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    workorderRecord: workorderRecord,
                                    workorderId: workorderId,
                                    urlRecord: urlRecord,
                                    // Otros
                                    id_campo_usuario_firma: id_campo_usuario_firma,
                                    id_campo_fecha_firma: id_campo_fecha_firma
                                };
                            }
                        } else if (method == 'eliminar_firma' && workorderRecord) {

                            // Setear datos al record
                            workorderRecord.setValue(id_campo_usuario_firma, '');
                            workorderRecord.setValue(id_campo_fecha_firma, '');
                            let workorderId = workorderRecord.save();
                            log.debug('', workorderId);

                            if (workorderId) {
                                // Obtener url del Record
                                let urlRecord = url.resolveRecord({
                                    recordType: 'workorder',
                                    recordId: workorder_id,
                                    params: {
                                        _status: 'PROCESS_SIGNATURE'
                                    }
                                })

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    workorderRecord: workorderRecord,
                                    workorderId: workorderId,
                                    urlRecord: urlRecord,
                                    // Otros
                                    id_campo_usuario_firma: id_campo_usuario_firma,
                                    id_campo_fecha_firma: id_campo_fecha_firma
                                };
                            }
                        } else if (method == 'getDataRevisionListaMateriales') {

                            // Obtener datos
                            let arrayRevisionListaMateriales = objHelper.getRevisionListaMateriales(id_revision_lista_materiales);

                            // Validar que encontro revision lista de materiales
                            if (arrayRevisionListaMateriales) {

                                // Debug
                                // objHelper.error_log('data', { method, id_revision_lista_materiales, arrayRevisionListaMateriales });

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    arrayRevisionListaMateriales: arrayRevisionListaMateriales
                                };
                            }
                        } else if (method == 'getDataConfiguracionUnidadMedida') {

                            // Obtener datos
                            let arrayConfiguracionUnidadMedida = objHelper.getConfiguracionUnidadMedida(id_subsidiaria);

                            // Validar que encontro configuracion de unidad de medida
                            if (arrayConfiguracionUnidadMedida) {

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    arrayConfiguracionUnidadMedida: arrayConfiguracionUnidadMedida
                                };
                            }
                        } else if (method == 'getDataConfiguracionEmpleadosPermisos') {

                            // Obtener datos
                            let arrayEmpleadosPermisos = objHelper.getConfiguracionEmpleadosPermisos(id_subsidiaria, perm);

                            // Validar que encontro configuracion de empleados permisos
                            if (arrayEmpleadosPermisos) {

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    arrayEmpleadosPermisos: arrayEmpleadosPermisos
                                };
                            }
                        }
                    } catch (err) {
                        // Respuesta
                        response = {
                            code: '400',
                            status: 'error',
                            method: method,
                            err: err
                        };
                    }

                    // Respuesta
                    scriptContext.response.setHeader('Content-type', 'application/json');
                    scriptContext.response.write(JSON.stringify(response));
                }
            }
        }

        return { onRequest }

    });
