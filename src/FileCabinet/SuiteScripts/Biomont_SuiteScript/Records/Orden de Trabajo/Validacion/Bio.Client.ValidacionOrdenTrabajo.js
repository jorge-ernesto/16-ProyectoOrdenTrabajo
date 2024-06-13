// Notas del archivo:
// - Secuencia de comando:
//      - Biomont CS Validacion Orden Trabajo (customscript_bio_cs_valida_orden_trabajo)
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
define(['N'],

    function (N) {

        function pageInit(scriptContext) {

            console.log("Script Validación de Enrutamiento en ejecución!")
        }

        function saveRecord(scriptContext) {

            var currentRecord = scriptContext.currentRecord;
            var isWIP = currentRecord.getValue({ fieldId: "iswip" });

            if (isWIP) {
                var bomId = currentRecord.getValue({ fieldId: "billofmaterials" });
                var bomRevision = currentRecord.getValue({ fieldId: "billofmaterialsrevision" });
                var routingId = currentRecord.getValue({ fieldId: "manufacturingrouting" });

                if (!bomId) {
                    alert("Debes completar el campo Lista de Materiales.");
                    return false; // Cancelar el guardado
                }

                if (!bomRevision) {
                    alert("Debes completar el campo Revisión de Lista de Materiales.");
                    return false; // Cancelar el guardado
                }

                if (!routingId) {
                    alert("Debes completar el campo Enrutamiento de Fabricación.");
                    return false; // Cancelar el guardado
                }
            }

            return true; // Permitir el guardado
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord
        };

    });
