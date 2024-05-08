// Notas del archivo:
// - Secuencia de comando:
//      - Biomont UE Orden Trabajo (customscript_bio_ue_orden_trabajo)
// - Registro:
//      - Orden de Trabajo (workorder)

// Validación como la usa LatamReady:
// - ClientScript           : No se ejecuta en modo ver. Solo se ejecuta en modo crear, copiar o editar.
// - En modo crear o editar : Validamos por el formulario.
// - En modo ver            : Validamos por el pais de la subsidiaria.

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['./lib/Bio.Library.Helper', 'N'],

    function (objHelper, N) {

        const { log, format } = N;
        const { serverWidget, message } = N.ui;

        /**
         * Formularios
         *
         * 151: BIO_FRM_ORDEN_DE_TRABAJO
         * 228: BIO_FRM_ORDEN_DE_TRABAJO_PILOTOS
         */
        const formularios = [151, 228];

        /******************/

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        function beforeLoad(scriptContext) {

            // Obtener el newRecord y type
            let { newRecord, type } = scriptContext;

            // Obtener datos
            let formulario = newRecord.getValue('customform') || null;
            let subsidiary_id = newRecord.getValue('subsidiary') || null;
            let country_subsidiary_id = subsidiary_id ? objHelper.getCountrySubsidiary(subsidiary_id) : null;

            // Modo ver y pais de subsidiaria "PE"
            if (type == 'view' && country_subsidiary_id == 'PE') {

                cargarPagina(scriptContext);
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function beforeSubmit(scriptContext) {

            // Obtener el newRecord y type
            let { newRecord, type } = scriptContext;

            // Obtener datos
            let formulario = newRecord.getValue('customform') || null;

            // Modo crear y formularios
            if (type == 'create' && formularios.includes(Number(formulario))) {

                // Setear fecha y hora actual
                var now = new Date();
                var datetime = format.format({ value: now, type: format.Type.DATETIME });

                if (Number(formulario) == 151) { // Formulario "BIO_FRM_ORDEN_DE_TRABAJO"
                    newRecord.setValue('custbody71', datetime)

                } else if (Number(formulario) == 228) { // Formulario "BIO_FRM_ORDEN_DE_TRABAJO_PILOTOS"
                    newRecord.setValue('custbody105', datetime);
                }
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function afterSubmit(scriptContext) {

        }

        function cargarPagina(scriptContext) {

            // Obtener el newRecord y type
            let { newRecord, type, form } = scriptContext;

            // Asociar ClientScript al formulario
            form.clientScriptModulePath = './Bio.Client.OrdenTrabajo.js';

            // Obtener datos
            let subsidiaria_id = newRecord.getValue('subsidiary');
            let tipo_ot_id = newRecord.getValue('custbody8');

            // Obtener datos
            let status = scriptContext.request.parameters['_status'];
            let { user } = objHelper.getUser();

            /****************** Mostrar mensajes ******************/
            if (status?.includes('PROCESS_SIGNATURE')) {
                form.addPageInitMessage({
                    type: message.Type.INFORMATION,
                    message: `Se firmo correctamente`,
                    duration: 25000 // 25 segundos
                });
            }

            /****************** Mostrar botones para firmar ******************/
            // Obtener datos
            let flujo_firmas_array = objHelper.getFlujoFirmas(subsidiaria_id, tipo_ot_id);

            // Validar que encontro flujo de firmas
            if (Object.keys(flujo_firmas_array).length > 0) {

                // Recorrer flujo de firmas
                flujo_firmas_array.some((element, i) => {

                    // Validar campo sin data - que no se haya firmado
                    if (!newRecord.getValue(element.id_campo_usuario_firma)) {

                        // Validar existencia de propiedades para botones
                        if (element.id_boton_firma && element.nombre_boton_firma && element.funcion_boton_firma) {

                            let empleados_perm_firmar_array = objHelper.getEmpleadosPermisoFirmar(subsidiaria_id, element.centro_costo.id_interno);

                            // Verificar empleados
                            if (empleados_perm_firmar_array.includes(user.id)) {

                                // Agregamos botones de forma dinamica
                                form.addButton({
                                    id: element.id_boton_firma,
                                    label: element.nombre_boton_firma,
                                    functionName: element.funcion_boton_firma + '()'
                                });
                            }
                        }

                        // Salir del bucle al encontrar una condición verdadera
                        return true;
                    }

                    // Seguir iterando con some
                    return false;
                });
            }

            /****************** Mostrar botones para eliminar firmas ******************/
            // Obtener datos
            let flujo_firmas_array_reverse = objHelper.getFlujoFirmas(subsidiaria_id, tipo_ot_id).reverse();

            // Validar que encontro flujo de firmas
            if (Object.keys(flujo_firmas_array_reverse).length > 0) {

                // Recorrer flujo de firmas
                flujo_firmas_array_reverse.some((element, i) => {

                    // Validar campo con data - que se haya firmado
                    if (newRecord.getValue(element.id_campo_usuario_firma)) {

                        // Validar existencia de propiedades para botones
                        if (element.id_boton_eliminar_firma && element.nombre_boton_eliminar_firma && element.funcion_boton_eliminar_firma) {

                            let empleados_perm_eliminar_array = objHelper.getEmpleadosPermisoEliminar(subsidiaria_id, element.centro_costo.id_interno);

                            // Verificar empleados
                            if (empleados_perm_eliminar_array.includes(user.id)) {

                                // Agregamos botones de forma dinamica
                                form.addButton({
                                    id: element.id_boton_eliminar_firma,
                                    label: element.nombre_boton_eliminar_firma,
                                    functionName: element.funcion_boton_eliminar_firma + '()'
                                });
                            }
                        }

                        // Salir del bucle al encontrar una condición verdadera
                        return true;
                    }

                    // Seguir iterando con some
                    return false;
                });
            }

            /****************** Mostrar botones para imprimir PDF ******************/
            form.addButton({
                id: 'custpage_button_descargar_pdf',
                label: 'Imprimir BOM',
                functionName: 'descargarPDF_imprimirBOM()'
            });
        }

        return { beforeLoad, beforeSubmit, afterSubmit };

    });
