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

        const scriptDownloadId = 'customscript_bio_sl_ord_trab_des_arc';
        const deployDownloadId = 'customdeploy_bio_sl_ord_trab_des_arc';

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

            // DEBUG
            // SIEMPRE SE EJECUTA
            console.log('pageInit!!!', scriptContext);

            // Modo crear, editar, copiar y formularios
            if ((mode == 'create' || mode == 'edit' || mode == 'copy') && formularios.includes(Number(formulario))) {

                // Deshabilitar campos firmas
                deshabilitarCamposFirmas(recordContext, mode);
            }
        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

            // Obtener el currentRecord y mode
            let recordContext = scriptContext.currentRecord;
            let mode = recordContext.getValue('id') ? 'edit' : 'create';

            // Obtener datos
            let formulario = recordContext.getValue('customform') || null;

            // Modo crear, editar, copiar y formularios
            if ((mode == 'create' || mode == 'edit' || mode == 'copy') && formularios.includes(Number(formulario))) {

                // Habilitar campos de sublista por estado
                habilitarCamposSublistaPorEstado(scriptContext, recordContext, mode);
            }

            return true;
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {

            // Obtener el currentRecord y mode
            let recordContext = scriptContext.currentRecord;
            let mode = recordContext.getValue('id') ? 'edit' : 'create';

            // Obtener datos
            let formulario = recordContext.getValue('customform') || null;

            // Modo crear, editar, copiar y formularios
            if ((mode == 'create' || mode == 'edit' || mode == 'copy') && formularios.includes(Number(formulario))) {

                setValueSubList(scriptContext, recordContext, mode);
            }
        }

        function setValueSubList(scriptContext, recordContext, mode) {

            // DEBUG
            // SI EL EVENTO OCURRE A NIVEL DE CAMPOS DE CABECERA
            if (isEmpty(scriptContext.sublistId)) {
                console.log('fieldChanged!!!', scriptContext);
            }

            // SI EL EVENTO OCURRE A NIVEL DE SUBLISTA
            if (!isEmpty(scriptContext.sublistId)) {
                console.log('fieldChanged!!!', scriptContext)
            }

            /******************/

            // SE EJECUTA SOLO CUANDO SE HACEN CAMBIOS EN LOS CAMPOS REVISION DE LISTA DE MATERIALES Y CANTIDAD
            if (scriptContext.fieldId == 'billofmaterialsrevision' || scriptContext.fieldId == 'quantity') {

                // Obtener data de la sublista
                let sublistName = 'item';
                let lineCount = recordContext.getLineCount({ sublistId: sublistName });
                let itemSublist = recordContext.getSublist({ sublistId: sublistName });

                // Obtener datos
                let id_revision_lista_materiales = recordContext.getValue('billofmaterialsrevision');
                let responseData = sendRequest({ method: 'getDataRevisionListaMateriales', id_revision_lista_materiales });
                let id_subsidiaria = recordContext.getValue('subsidiary');
                let responseData_ = sendRequest({ method: 'getDataConfiguracionUnidadMedida', id_subsidiaria });

                // Debug
                // console.log('data', { id_revision_lista_materiales, responseData, id_subsidiaria, responseData_ });

                // Validar response
                if (responseData.status == 'success') {

                    let arrayRevisionListaMateriales = responseData.arrayRevisionListaMateriales;
                    let arrayConfiguracionUnidadMedida = responseData_.arrayConfiguracionUnidadMedida;

                    // Recorrer sublista
                    for (let i = 0; i < lineCount; i++) {
                        // console.log('i', i);

                        // Seleccionar linea actual de la sublista
                        recordContext.selectLine({
                            sublistId: sublistName,
                            line: i
                        });

                        // Obtener campos
                        let columnItem = recordContext.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: i
                        });
                        let columnComponentYield = recordContext.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'componentyield',
                            line: i
                        });
                        let columnUnits = recordContext.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'units',
                            line: i
                        });

                        // Validar data
                        if (columnItem && columnComponentYield && columnUnits) {

                            // Obtener cantidad de lista de materiales inicial
                            let cantidad_bom_ini = calculateQuantityBOMInit(recordContext, columnItem, columnComponentYield, columnUnits, arrayRevisionListaMateriales, arrayConfiguracionUnidadMedida);

                            // Setear cantidad de lista de materiales inicial
                            recordContext.setCurrentSublistValue({
                                sublistId: sublistName,
                                fieldId: 'custcol_bio_cant_lis_mat_ini',
                                line: i,
                                value: cantidad_bom_ini,
                                ignoreFieldChange: true
                            });

                            // Commit en linea
                            recordContext.commitLine({
                                sublistId: sublistName
                            });
                        }
                    }
                }
            }

            /******************/

            // SE EJECUTA SOLO CUANDO SE HACEN CAMBIOS EN LA SUBLISTA ITEM Y CAMPOS ARTICULO, PORCENTAJE DE RENDIMIENTO DEL COMPONENTE
            if (scriptContext.sublistId == 'item' && (scriptContext.fieldId == 'item' || scriptContext.fieldId == 'componentyield' || scriptContext.fieldId == 'units')) {

                // Obtener data de la sublista
                let line = scriptContext.line;

                // Obtener datos
                let id_revision_lista_materiales = recordContext.getValue('billofmaterialsrevision');
                let responseData = sendRequest({ method: 'getDataRevisionListaMateriales', id_revision_lista_materiales });
                let id_subsidiaria = recordContext.getValue('subsidiary');
                let responseData_ = sendRequest({ method: 'getDataConfiguracionUnidadMedida', id_subsidiaria });

                // Debug
                // console.log('data', { id_revision_lista_materiales, responseData, id_subsidiaria, responseData_ });

                // Validar response
                if (responseData.status == 'success') {

                    let arrayRevisionListaMateriales = responseData.arrayRevisionListaMateriales;
                    let arrayConfiguracionUnidadMedida = responseData_.arrayConfiguracionUnidadMedida;

                    // Obtener campos
                    let columnItem = recordContext.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: line
                    });
                    let columnComponentYield = recordContext.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'componentyield',
                        line: line
                    });
                    let columnUnits = recordContext.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'units',
                        line: line
                    });

                    // Validar data
                    if (columnItem && columnComponentYield && columnUnits) {

                        // Solo realiza el calculo cuando encuentra el articulo en la revision de lista de materiales
                        if (arrayRevisionListaMateriales[columnItem]) {

                            // Obtener cantidad de lista de materiales inicial
                            let cantidad_bom_ini = calculateQuantityBOMInit(recordContext, columnItem, columnComponentYield, columnUnits, arrayRevisionListaMateriales, arrayConfiguracionUnidadMedida);

                            // Setear cantidad de lista de materiales inicial
                            recordContext.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_bio_cant_lis_mat_ini',
                                line: line,
                                value: cantidad_bom_ini,
                                ignoreFieldChange: true
                            });
                        }
                    }
                }
            }

            /******************/

            // SE EJECUTA SOLO CUANDO SE HACEN CAMBIOS EN LA SUBLISTA ITEM O CAMPO ESTADO
            if (scriptContext.sublistId == 'item' || scriptContext.fieldId == 'orderstatus') {

                // Habilitar campos de sublista por estado
                habilitarCamposSublistaPorEstado(scriptContext, recordContext, mode);
            }
        }

        function calculateQuantityBOMInit(recordContext, columnItem, columnComponentYield, columnUnits, arrayRevisionListaMateriales, arrayConfiguracionUnidadMedida) {

            // Debug
            console.log('req calculateQuantityBOMInit', { recordContext, columnItem, columnComponentYield, columnUnits, arrayRevisionListaMateriales, arrayConfiguracionUnidadMedida })

            // Calcular la cantidad de lista de materiales inicial - redondeada a 5 decimales
            let fDecimal = 5;
            let cantidad_bom_ini = 0;
            let cantidad_bom = arrayRevisionListaMateriales?.[columnItem]?.['cantidad_bom'];
            let cantidad = recordContext.getValue('quantity');
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
            console.log('res calculateQuantityBOMInit', { cantidad_bom_ini, cantidad_bom, cantidad, rend_comp })

            return cantidad_bom_ini;
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

            // Obtener campo y deshabilitarlo
            // https://6462530-sb1.app.netsuite.com/app/help/helpcenter.nl?fid=section_4625600928.html

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

        function habilitarCamposSublistaPorEstado(scriptContext, recordContext, mode) {

            // DEBUG
            // SI EL EVENTO OCURRE A NIVEL DE CAMPOS DE CABECERA
            if (isEmpty(scriptContext.sublistId)) {
                console.log('validateField!!!', scriptContext);
            }

            // SI EL EVENTO OCURRE A NIVEL DE SUBLISTA
            if (!isEmpty(scriptContext.sublistId)) {
                console.log('validateField!!!', scriptContext)
            }

            /******************/

            // SE EJECUTA SOLO CUANDO SE HACEN CAMBIOS EN LA SUBLISTA ITEM O CAMPO ESTADO
            if (scriptContext.sublistId == 'item' || scriptContext.fieldId == 'orderstatus') {

                // Deshabilitar campos sublista
                deshabilitarCamposSublista(recordContext, mode);

                /**
                 * Funcionalidad para habilitar y deshabilitar campos
                 * Estado - Values.
                    - Planificada: A
                    - Liberada: B
                */
                // Obtener combo "Estado"
                let comboEstado = recordContext.getValue('orderstatus');

                // Obtener user
                // let { user } = objHelper.getUser();

                // Habilitar campos sublista
                if (comboEstado == 'A') { // || user.role == '3'
                    habilitarCamposSublista(recordContext, mode);
                }
            }
        }

        function deshabilitarCamposSublista(recordContext, mode) {

            let recordObj = recordContext;

            // Obtener columna y deshabilitarla
            // https://6462530-sb1.app.netsuite.com/app/help/helpcenter.nl?fid=section_158618597707.html
            var sublistObj = recordObj.getSublist({
                sublistId: 'item'
            });
            var columnObj = sublistObj.getColumn({
                fieldId: 'custcol_bio_cant_lis_mat_ini'
            });

            // Deshabilitar campos
            columnObj.isDisabled = true;
        }

        function habilitarCamposSublista(recordContext, mode) {

            let recordObj = recordContext;

            // Obtener columna
            // https://6462530-sb1.app.netsuite.com/app/help/helpcenter.nl?fid=section_158618597707.html
            var sublistObj = recordObj.getSublist({
                sublistId: 'item'
            });
            var columnObj = sublistObj.getColumn({
                fieldId: 'custcol_bio_cant_lis_mat_ini'
            });

            // Deshabilitar campos
            columnObj.isDisabled = false;
        }

        function validarCamposFirmas(recordContext, mode) {

            // Modo editar
            if (mode == 'edit') {

                // Obtener datos
                let responseData = sendRequest({ method: 'getDataConfiguracionFlujoFirmas' });
                let id_subsidiaria = recordContext.getValue('subsidiary');
                let responseData_ = sendRequest({ method: 'getDataConfiguracionEmpleadosPermisos', id_subsidiaria, perm: 'guardar' });

                // Obtener user
                let { user } = objHelper.getUser();

                // Validar response
                if (responseData.status == 'success') {

                    // Obtener datos
                    let arrayFlujoFirmas = responseData.arrayFlujoFirmas;
                    let arrayEmpleadosPermisos = responseData_.arrayEmpleadosPermisos;

                    // Validar que encontro flujo de firmas
                    if (Object.keys(arrayFlujoFirmas).length > 0) {

                        let ultimoElementoFlujoFirmas = arrayFlujoFirmas[arrayFlujoFirmas.length - 1];
                        let ultimaFirma = recordContext.getValue(ultimoElementoFlujoFirmas['id_campo_usuario_firma']);

                        // Validar campo con data - que se haya firmado
                        // Validar que usuario no este registros en empleados permisos
                        if (ultimaFirma && !arrayEmpleadosPermisos.includes(Number(user.id))) {

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

        function sendRequestWrapper({ method, id_campo_usuario_firma = '', id_campo_fecha_firma = '', id_revision_lista_materiales = '', id_subsidiaria = '', perm = '' }) {

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
                        let responseData = sendRequest({ method, id_campo_usuario_firma, id_campo_fecha_firma, id_revision_lista_materiales, id_subsidiaria, perm });
                        if (responseData.status == 'success' && responseData.urlRecord) {
                            refreshPage(responseData);
                        }
                    }
                });
            });
        }

        function sendRequest({ method, id_campo_usuario_firma = '', id_campo_fecha_firma = '', id_revision_lista_materiales = '', id_subsidiaria = '', perm = '' }) {

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
                    _id_campo_fecha_firma: id_campo_fecha_firma,
                    _id_revision_lista_materiales: id_revision_lista_materiales,
                    _id_subsidiaria: id_subsidiaria,
                    _perm: perm
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

        // Obtener datos
        let responseData = sendRequest({ method: 'getDataConfiguracionFlujoFirmas' });

        // Validar response
        if (responseData.status == 'success') {

            /****************** Funciones para botones firmar ******************/

            // Obtener datos
            let flujo_firmas_array = responseData.arrayFlujoFirmas;

            // Validar que encontro flujo de firmas
            if (Object.keys(flujo_firmas_array).length > 0) {

                // Recorrer flujo de firmas
                flujo_firmas_array.some((element, i) => {

                    // Agregamos funciones de forma dinamica
                    dynamicFunctions[element.funcion_boton_firma] = function () {
                        sendRequestWrapper({ method: 'firmar', id_campo_usuario_firma: element.id_campo_usuario_firma, id_campo_fecha_firma: element.id_campo_fecha_firma });
                        console.log(element.funcion_boton_firma)
                    };

                    // Seguir iterando con some
                    return false;
                });
            }

            /****************** Funciones para botones eliminar firmas ******************/

            // Obtener datos
            let flujo_firmas_array_reverse = responseData.arrayFlujoFirmas.reverse();

            // Validar que encontro flujo de firmas
            if (Object.keys(flujo_firmas_array_reverse).length > 0) {

                // Recorrer flujo de firmas
                flujo_firmas_array_reverse.some((element, i) => {

                    // Agregamos funciones de forma dinamica
                    dynamicFunctions[element.funcion_boton_eliminar_firma] = function () {
                        sendRequestWrapper({ method: 'eliminar_firma', id_campo_usuario_firma: element.id_campo_usuario_firma, id_campo_fecha_firma: element.id_campo_fecha_firma });
                        console.log(element.funcion_boton_eliminar_firma)
                    };

                    // Seguir iterando con some
                    return false;
                });
            }
        }

        /****************** Funciones para botones imprimir PDF ******************/

        function descargarPDF_imprimirBOM() {

            // Obtener el id interno del record proyecto
            let recordContext = currentRecord.get();
            let workorder_id = recordContext.getValue('id');

            // Obtener url del Suitelet mediante ID del Script y ID del Despliegue
            let suitelet = url.resolveScript({
                deploymentId: deployDownloadId,
                scriptId: scriptDownloadId,
                params: {
                    _button: 'pdf',
                    _type: 'imprimir_bom',
                    _workorder_id: workorder_id
                }
            });

            // Evitar que aparezca el mensaje 'Estas seguro que deseas salir de la pantalla'
            setWindowChanged(window, false);

            // Abrir url
            window.open(suitelet);
        }

        /****************** Helper ******************/

        let isEmpty = (value) => {

            if (value === ``) {
                return true;
            }

            if (value === null) {
                return true;
            }

            if (value === undefined) {
                return true;
            }

            if (value === `undefined`) {
                return true;
            }

            if (value === `null`) {
                return true;
            }

            return false;
        }

        return {
            pageInit: pageInit,
            validateField: validateField,
            fieldChanged: fieldChanged,
            saveRecord: saveRecord,
            ...dynamicFunctions,
            descargarPDF_imprimirBOM
        };

    });
