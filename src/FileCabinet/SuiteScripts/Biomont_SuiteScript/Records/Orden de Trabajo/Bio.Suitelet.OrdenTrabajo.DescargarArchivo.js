// Notas del archivo:
// - Secuencia de comando:
//      - Biomont SL Ord. Trab. Descargar Archivo (customscript_bio_sl_ord_trab_des_arc)

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['./lib/Bio.Library.Helper', 'N'],

    function (objHelper, N) {

        const { log, file, render, encode, record } = N;

        /**
         * Tipos de Orden de Trabajo
         *
         * 1: FABRICACIÓN
         * 2: ENSAYOS Y PILOTOS
         * 3: ENVASADO Y EMPACADO
         * 4: REACONDICIONADO
         * 5: HORAS COMPLEMENTARIAS
         * 6: ACONDICIONADO
         */
        const tipos_ot = [1, 2, 3, 4, 6];

        /******************/

        // Crear PDF
        function createPDF_imprimirBOM(action, workorder_id, workorder_data) {
            // Nombre del archivo
            let typeRep = 'reporteOrdenTrabajoBOM';
            let titleDocument = 'Reporte Orden de Trabajo - BOM'

            // Template del archivo
            let templatePdf = (workorder_data.tipo_ot == 2) ? 'pdfreport_bom_desarrollo_farmaceutico' : 'pdfreport_bom_logistica';

            // Crear PDF - Contenido dinamico
            let pdfContent = file.load(`./template/PDF/${templatePdf}.ftl`).getContents();
            let rendererPDF = render.create();
            rendererPDF.templateContent = pdfContent;

            // Enviar datos a PDF
            rendererPDF.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: "input",
                data: {
                    data: JSON.stringify({
                        name: titleDocument,
                        workorder_id: workorder_id,
                        workorder_data: workorder_data,
                        img_url: 'https://www.biomont.com.pe/storage/img/logo.png',
                        img_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ0AAABBCAYAAADL2qaCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozZTBjOWQzMC04Mzc5LTRmMDUtYjc2ZC04MDVlNDI4NGEwMjAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEFBQkExMjlDQURGMTFFQTk2QzQ4QzY3MTM5MzdENTgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEFBQkExMjhDQURGMTFFQTk2QzQ4QzY3MTM5MzdENTgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1ZDlkMWU3OS0zZjY3LTQ0ODctYTFlNy01Zjg3ODc0YWY3NzkiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDoxMmNkYjZkNi1jOTRmLWVlNDgtYmI4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'
                    })
                }
            });

            let pdfFile = null;

            if (action == 'download') {
                // Crear PDF
                pdfFile = rendererPDF.renderAsPdf();

                // Reescribir datos de PDF
                pdfFile.name = `biomont_${typeRep}.pdf`;
            } else if (action == 'preview') {
                // Crear PDF
                pdfFile = rendererPDF.renderAsString().replace(/&/g, '&amp;');
            }

            return { pdfFile };
        }

        function getData_imprimirBOM(workorder_id) {
            // Obtener data de orden de trabajo - cabecera
            var dataCabeceraOrdenTrabajo = objHelper.getCabeceraOrdenTrabajo(workorder_id);

            // Obtener el record de articulo ensamblaje
            let assemblyitem_id = dataCabeceraOrdenTrabajo.assemblyitem_id;
            var assemblyitemRecord = record.load({
                type: 'lotnumberedassemblyitem',
                id: assemblyitem_id
            });

            // Obtener data de orden de trabajo - detalle
            let bomrevision_id = dataCabeceraOrdenTrabajo.bomrevision_id;
            let subsidiary_id = dataCabeceraOrdenTrabajo.subsidiary_id;
            let dataDetalleOrdenTrabajo = objHelper.getDetalleOrdenTrabajo(workorder_id);
            let dataRevisionListaMateriales = objHelper.getRevisionListaMateriales(bomrevision_id);
            let dataConfiguracionUnidadMedida = objHelper.getConfiguracionUnidadMedida(subsidiary_id);
            // Obtener cantidad de lista de materiales inicial
            let dataDetalleOrdenTrabajo_cantLisMatIni = objHelper.getDetalleOrdenTrabajo_cantLisMatIni(dataCabeceraOrdenTrabajo, dataDetalleOrdenTrabajo, dataRevisionListaMateriales, dataConfiguracionUnidadMedida);
            // Obtener flag de principio activo
            let dataDetalleOrdenTrabajo_principioActivo = objHelper.getDetalleOrdenTrabajo_principioActivo(dataDetalleOrdenTrabajo_cantLisMatIni, dataRevisionListaMateriales);

            // Procesar informacion
            let fecha_registro = dataCabeceraOrdenTrabajo.fecha_registro;
            let fecha_fabricacion = dataCabeceraOrdenTrabajo.fecha_fabricacion;
            fecha_fabricacion = fecha_fabricacion ? fecha_fabricacion.split('/')[1] + '-' + fecha_fabricacion.split('/')[2] : '';
            let fecha_expira = dataCabeceraOrdenTrabajo.fecha_expira;
            fecha_expira = fecha_expira ? fecha_expira.split('/')[1] + '-' + fecha_expira.split('/')[2] : '';

            // Debug
            // objHelper.error_log('data', { dataDetalleOrdenTrabajo, dataRevisionListaMateriales, dataDetalleOrdenTrabajo_principioActivo });

            // Obtener data
            let data = {
                // Tipo de orden de trabajo
                tipo_ot: dataCabeceraOrdenTrabajo.tipo_ot,
                tipo_ot_nombre: dataCabeceraOrdenTrabajo.tipo_ot_nombre,

                // Data
                // Cabecera
                codigo_producto: assemblyitemRecord.getValue('itemid'),
                producto: assemblyitemRecord.getValue('displayname'),
                numero_ot: dataCabeceraOrdenTrabajo.numero_ot,
                cantidad: dataCabeceraOrdenTrabajo.cantidad,
                unidades: dataCabeceraOrdenTrabajo.unidades,
                cantidad_producir: dataCabeceraOrdenTrabajo.cantidad + ' ' + dataCabeceraOrdenTrabajo.unidades,
                fecha_registro: fecha_registro,
                lote: dataCabeceraOrdenTrabajo.lote,
                fecha_fabricacion: fecha_fabricacion ,
                fecha_expira: fecha_expira || '-',
                linea: dataCabeceraOrdenTrabajo.linea,
                observaciones: dataCabeceraOrdenTrabajo.observaciones,
                // Detalle
                dataDetalleOrdenTrabajo: dataDetalleOrdenTrabajo_principioActivo,
                // Firmas OTs que inicia Logística
                emitido_por: dataCabeceraOrdenTrabajo.emitido_por,
                fecha_firma_emitido: dataCabeceraOrdenTrabajo.fecha_firma_emitido,
                ajustado_por_almacen:  dataCabeceraOrdenTrabajo.ajustado_por_almacen,
                fecha_firma_almacen: dataCabeceraOrdenTrabajo.fecha_firma_almacen,
                verificado_por_aseguramiento: dataCabeceraOrdenTrabajo.verificado_por_aseguramiento,
                fecha_firma_aseguramiento: dataCabeceraOrdenTrabajo.fecha_firma_aseguramiento,
                // Firmas OTs que inicia Investigación y Desarrollo
                emitido_por__id: dataCabeceraOrdenTrabajo.emitido_por__id,
                fecha_firma_emitido__id: dataCabeceraOrdenTrabajo.fecha_firma_emitido__id,
                revisado_por__id:  dataCabeceraOrdenTrabajo.revisado_por__id,
                fecha_firma_revisado__id: dataCabeceraOrdenTrabajo.fecha_firma_revisado__id,
                aprobado_por__id: dataCabeceraOrdenTrabajo.aprobado_por__id,
                fecha_firma_aprobado__id: dataCabeceraOrdenTrabajo.fecha_firma_aprobado__id,
                recibido_por__id: dataCabeceraOrdenTrabajo.recibido_por__id,
                fecha_firma_recibido__id: dataCabeceraOrdenTrabajo.fecha_firma_recibido__id,
            }

            // objHelper.error_log('data', data);
            return data;
        }

        function validarPermiso_imprimirBOM(workorder_id) {
            // Obtener data de orden de trabajo - cabecera
            var dataCabeceraOrdenTrabajo = objHelper.getCabeceraOrdenTrabajo(workorder_id);

            // Validar permiso de tipo de orden de trabajo
            let tipo_ot = dataCabeceraOrdenTrabajo.tipo_ot;
            if (!tipo_ot) {
                objHelper.error_log('Mensaje', 'No se registro Tipo de Orden de Trabajo');
            }
            if (!tipos_ot.includes(Number(tipo_ot))) {
                objHelper.error_log('Mensaje', 'No se permite el Tipo de Orden de Trabajo');
            }
        }

        /******************/

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        function onRequest(scriptContext) {
            // log.debug('method', scriptContext.request.method);
            // log.debug('parameteres', scriptContext.request.parameters);

            if (scriptContext.request.method == 'GET') {
                // Obtener datos por url
                let button = scriptContext.request.parameters['_button'];
                let type = scriptContext.request.parameters['_type'];
                let action = scriptContext.request.parameters['_action'] || 'download';
                let workorder_id = scriptContext.request.parameters['_workorder_id'];

                if (button == 'pdf' && type == 'imprimir_bom') {

                    // Validar permiso
                    validarPermiso_imprimirBOM(workorder_id);

                    // Obtener datos
                    let workorder_data = getData_imprimirBOM(workorder_id);

                    // Crear PDF
                    let { pdfFile } = createPDF_imprimirBOM(action, workorder_id, workorder_data);

                    if (action == 'download') {
                        // Descargar PDF
                        scriptContext.response.writeFile({
                            file: pdfFile
                        });
                    } else if (action == 'preview') {
                        // Descargar PDF
                        scriptContext.response.renderPdf(pdfFile);
                    }
                }
            }
        }

        return { onRequest }

    });
