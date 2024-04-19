// Notas del archivo:
// - Secuencia de comando:
//      - Biomont CS Orden Trabajo (customscript_bio_cs_orden_trabajo)
// - Registro:
//      - Orden de Trabajo (workorder)

// Validación como la usa LatamReady:
// - ClientScript           : No se ejecuta en modo ver. Solo se ejecuta en modo crear, copiar o editar.
// - En modo crear o editar : Validamos por el formulario.
// - En modo ver            : Validamos por el pais de la subsidiaria.

/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['./lib/Bio.Library.Helper', 'N'],

    function (objHelper, N) {

        const { log, currentRecord, url, https, http } = N;

        const scriptId = 'customscript_bio_sl_api_orden_trabajo';
        const deployId = 'customdeploy_bio_sl_api_orden_trabajo';

        /**
         * Formularios
         *
         * 151: BIO_FRM_ORDEN_DE_TRABAJO
         * 228: BIO_FRM_ORDEN_DE_TRABAJO_PILOTOS
         */
        const formularios = [151, 228];

        /******************/

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

            // Obtener el currentRecord y mode
            let recordContext = scriptContext.currentRecord;
            let mode = scriptContext.mode;

            // Obtener datos
            let formulario = recordContext.getValue('customform') || null;

            // Debug
            console.log('pageInit');
            console.log({ recordContext, mode });

            // Modo crear, editar, copiar y formularios
            if ((mode == 'create' || mode == 'edit' || mode == 'copy') && formularios.includes(Number(formulario))) {

                // Deshabilitar campos firmas
                deshabilitarCamposFirmas(recordContext, mode);
            }
        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

            // Obtener el currentRecord
            let recordContext = scriptContext.currentRecord;
            let mode = recordContext.getValue('id') ? 'edit' : 'create';

            // Obtener datos
            let formulario = recordContext.getValue('customform') || null;

            // Debug
            console.log('saveRecord');
            console.log({ recordContext, mode });

            // Modo crear, editar, copiar y formularios
            if ((mode == 'create' || mode == 'edit' || mode == 'copy') && formularios.includes(Number(formulario))) {

                // Validar campos firmas
                if (validarCamposFirmas(recordContext, mode)) {
                    return false;
                }
            }

            return true;
        }

        /****************** Funcionalidad en campos ******************/

        function deshabilitarCamposFirmas(recordContext, mode) {

            // SuiteScript 2.x Modules
            // N/currentRecord Module
            // https://6462530.app.netsuite.com/app/help/helpcenter.nl?fid=section_4625600928.html

            // Deshabilitar campos
            // Formulario "BIO_FRM_ORDEN_DE_TRABAJO"
            // if (recordContext.getField('custbody67')) recordContext.getField('custbody67').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody71')) recordContext.getField('custbody71').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody69')) recordContext.getField('custbody69').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody72')) recordContext.getField('custbody72').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody70')) recordContext.getField('custbody70').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody73')) recordContext.getField('custbody73').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody68')) recordContext.getField('custbody68').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody74')) recordContext.getField('custbody74').isDisabled = true; // Se deshabilita

            // Formulario "BIO_FRM_ORDEN_DE_TRABAJO_PILOTOS"
            // if (recordContext.getField('custbody80')) recordContext.getField('custbody80').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody105')) recordContext.getField('custbody105').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody69')) recordContext.getField('custbody69').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody106')) recordContext.getField('custbody106').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody103')) recordContext.getField('custbody103').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody107')) recordContext.getField('custbody107').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody104')) recordContext.getField('custbody104').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custbody108')) recordContext.getField('custbody108').isDisabled = true; // Se deshabilita

            // Modo editar
            if (mode == 'edit') {
                // Formulario "BIO_FRM_ORDEN_DE_TRABAJO"
                if (recordContext.getField('custbody67')) recordContext.getField('custbody67').isDisabled = true; // Se deshabilita

                // Formulario "BIO_FRM_ORDEN_DE_TRABAJO_PILOTOS"
                if (recordContext.getField('custbody80')) recordContext.getField('custbody80').isDisabled = true; // Se deshabilita
            }
        }

        function validarCamposFirmas(recordContext, mode) {

            // Modo editar
            if (mode == 'edit') {

                // Obtener datos
                let subsidiariaId = recordContext.getValue('subsidiary');
                let tipoOtId = recordContext.getValue('custbody8');
                let arrayFlujoFirmas = objHelper.getFlujoFirmas(subsidiariaId, tipoOtId);

                // Validar que encontro flujo de firmas
                if (Object.keys(arrayFlujoFirmas).length > 0) {

                    let ultimoElementoFlujoFirmas = arrayFlujoFirmas[arrayFlujoFirmas.length - 1];
                    let ultimaFirma = recordContext.getValue(ultimoElementoFlujoFirmas['id_campo_usuario_firma']);

                    // Validar campo con data - que se haya firmado
                    if (ultimaFirma) {

                        // Cargar Sweet Alert
                        loadSweetAlertLibrary().then(function () {

                            // Ejecutar validacion
                            Swal.fire({
                                icon: "error",
                                title: "Oops...",
                                text: "Flujo de firmas completo. No puede guardar el registro",
                            });
                        });

                        return true;
                    }
                }
            }

            return false;
        }

        /****************** Solicitud HTTP ******************/

        function loadSweetAlertLibrary() {
            return new Promise(function (resolve, reject) {
                var sweetAlertScript = document.createElement('script');
                sweetAlertScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
                sweetAlertScript.onload = resolve;
                document.head.appendChild(sweetAlertScript);
            });
        }

        function getUrlSuitelet() {

            // Obtener url del Suitelet mediante ID del Script y ID del Despliegue
            let suitelet = url.resolveScript({
                deploymentId: deployId,
                scriptId: scriptId
            });

            return suitelet;
        }

        function sendRequestWrapper(method, id_campo_usuario_firma = '', id_campo_fecha_firma = '') {

            // Cargar Sweet Alert
            loadSweetAlertLibrary().then(function () {

                // Ejecutar confirmacion
                Swal.fire({
                    title: "¿Está seguro?",
                    text: "¡Debe confirmar la acción!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Enviar"
                }).then((result) => {
                    if (result.isConfirmed) {

                        // Ejecutar peticion
                        let responseData = sendRequest(method, id_campo_usuario_firma, id_campo_fecha_firma);
                        if (responseData.status == 'success' && responseData.urlRecord) {
                            refreshPage(responseData);
                        }
                    }
                });
            });
        }

        function sendRequest(method, id_campo_usuario_firma = '', id_campo_fecha_firma = '') {

            // Obtener el id interno del record proyecto
            let recordContext = currentRecord.get();
            let workorder_id = recordContext.getValue('id');

            // Obtener url del Suitelet mediante ID del Script y ID del Despliegue
            let suitelet = getUrlSuitelet();

            // Solicitud HTTP
            let response = https.post({
                url: suitelet,
                body: JSON.stringify({
                    _method: method,
                    _workorder_id: workorder_id,
                    _id_campo_usuario_firma: id_campo_usuario_firma,
                    _id_campo_fecha_firma: id_campo_fecha_firma
                })
            });
            let responseData = JSON.parse(response.body);
            console.log('responseData', responseData);

            return responseData;
        }

        function refreshPage(responseData) {

            // Evitar que aparezca el mensaje 'Estas seguro que deseas salir de la pantalla'
            setWindowChanged(window, false);

            // Redirigir a la url
            window.location.href = responseData.urlRecord;
        }

        /****************** Funciones para firmar / Funciones para eliminar firmas ******************/

        let dynamicFunctions = {};

        // Solicitud HTTP
        let responseData = sendRequest('getDataFlujoFirmas');

        // Validar response
        if (responseData.status == 'success') {

            /****************** Funciones para firmar ******************/

            // Obtener datos
            let flujo_firmas_array = responseData.arrayFlujoFirmas;

            // Validar que encontro flujo de firmas
            if (Object.keys(flujo_firmas_array).length > 0) {

                // Recorrer flujo de firmas
                flujo_firmas_array.some((element, i) => {

                    // Agregamos funciones de forma dinamica
                    dynamicFunctions[element.funcion_boton_firma] = function () {
                        sendRequestWrapper('firmar', element.id_campo_usuario_firma, element.id_campo_fecha_firma);
                        console.log(element.funcion_boton_firma)
                    };

                    // Seguir iterando some
                    return false;
                });
            }

            /****************** Funciones para eliminar firmas ******************/

            // Obtener datos
            let flujo_firmas_array_reverse = responseData.arrayFlujoFirmas.reverse();

            // Validar que encontro flujo de firmas
            if (Object.keys(flujo_firmas_array_reverse).length > 0) {

                // Recorrer flujo de firmas
                flujo_firmas_array_reverse.some((element, i) => {

                    // Agregamos funciones de forma dinamica
                    dynamicFunctions[element.funcion_boton_eliminar_firma] = function () {
                        sendRequestWrapper('eliminar_firma', element.id_campo_usuario_firma, element.id_campo_fecha_firma);
                        console.log(element.funcion_boton_eliminar_firma)
                    };

                    // Seguir iterando some
                    return false;
                });
            }
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            ...dynamicFunctions
        };

    });
