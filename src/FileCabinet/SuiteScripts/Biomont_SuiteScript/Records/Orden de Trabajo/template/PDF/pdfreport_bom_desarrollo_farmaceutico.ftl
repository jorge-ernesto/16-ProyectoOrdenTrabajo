<#-- CONFIGURACION FREEMARKER -->
<#setting locale = "computer">
<#setting number_format = "computer">

<#assign params = input.data?eval>
<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
    <head>
        <style>
            body {
                font-family: sans-serif;
            }

            .bold {
                font-weight: bold;
            }

            .center {
                text-align: center;
                margin: 0 auto;
            }

            .left {
                text-align: left;
            }

            .pb1 {
                padding-bottom: 1px;
            }

            .fs18 {
                font-size: 18px;
            }

            .fs15 {
                font-size: 15px;
            }

            .fs12 {
                font-size: 12px;
            }

            .fs10 {
                font-size: 10px;
            }

            .fs9 {
                font-size: 9px;
            }

            .fs8 {
                font-size: 8px;
            }

            .fs7 {
                font-size: 7px;
            }

            .border-collapse {
                border-collapse: collapse; /* Asegura que los bordes de las celdas se fusionen correctamente */
            }

            .tbody {
                border-collapse: collapse;
                width: 100%;
            }

            .tbody th,
            .tbody td {
                border: 0.1mm solid #000000;
                text-align: center;
                padding: 3px;
            }

            img {
                width: 120px;
                height: 40px;
            }
        </style>

        <macrolist>
            <macro id="nlfooter">

                <table width="100%" class="fs9 border-collapse">
                    <tfoot>
                        <tr>
                            <td colspan="5" align="right">Página <pagenumber/> / <totalpages/></td>
                        </tr>
                    </tfoot>
                </table>

            </macro>
        </macrolist>
    </head>

    <body size="A4" footer="nlfooter">

        <!-- <img src='https://www.biomont.com.pe/storage/img/logo.png'></img> -->

        <table width="100%" class="fs9 border-collapse" cellpadding="1">
            <thead>
                <tr>
					<th rowspan="4" colspan="1" align="left" valign="middle">
						<img src='${params.img_base64}'></img>
						<b>Laboratorios Biomont S.A.</b>
					</th>
					<th colspan="5" align="right" valign="middle">
						<span class="fs15"><b>F-DSF.023.01</b></span>
					</th>
				</tr>
                <tr>
                    <th colspan="5" align="right" valign="middle">
						<span class="fs18"><b>ORDEN DE TRABAJO</b></span>
					</th>
                </tr>
                <tr>
                    <th colspan="5" align="right" valign="middle">
						<span class="fs12"><b>Tipo de Orden de Trabajo:</b> ${params.workorder_data.tipo_ot_nombre}</span>
					</th>
                </tr>
                <tr>
                    <th colspan="5"></th>
                </tr>
            </thead>
        </table>

        <!-- ORDEN DE TRABAJO -->
        <table width="100%" class="fs9 border-collapse" style="margin-top: 10px; border: 0.1mm solid #000000;" cellpadding="3">
            <tr>
                <th colspan="1" align="right"><b>Código de Producto:</b></th>
                <th colspan="1">${params.workorder_data.codigo_producto}</th>
                <th colspan="1" align="right"><b>Producto:</b></th>
                <th colspan="1">${params.workorder_data.producto}</th>
                <th colspan="1"></th>
            </tr>
            <tr>
                <th colspan="1" align="right"><b>OT:</b></th>
                <th colspan="1">${params.workorder_data.numero_ot}</th>
                <th colspan="1" align="right"><b>Cantidad a Producir:</b></th>
                <th colspan="1">${params.workorder_data.cantidad_producir}</th>
                <th colspan="1"></th>
            </tr>
            <tr>
                <th colspan="1" align="right"><b>F. registro:</b></th>
                <th colspan="1">${params.workorder_data.fecha_registro}</th>
                <th colspan="1" align="right"><b>Lote:</b></th>
                <th colspan="1">${params.workorder_data.lote}</th>
                <th colspan="1"></th>
            </tr>
            <tr>
                <th colspan="1" align="right"><b>F. Fabricación:</b></th>
                <th colspan="1">${params.workorder_data.fecha_fabricacion}</th>
                <th colspan="1" align="right"><b>F. Expira:</b></th>
                <th colspan="1">${params.workorder_data.fecha_expira}</th>
                <th colspan="1"></th>
            </tr>
            <tr>
                <th colspan="1" align="right"><b>Línea:</b></th>
                <th colspan="1">${params.workorder_data.linea}</th>
                <th colspan="1" align="right"><b>Principio activo:</b></th>
                <#if (params.workorder_data.tipo_ot == '3')>
                    <th colspan="1">-</th>
                <#else>
                    <th colspan="1"><p style='background-color: #D6DBDF; color: #D6DBDF;'>Hola</p></th>
                </#if>
                <th colspan="1"></th>
            </tr>
        </table>

        <!-- ORDEN DE TRABAJO -->
        <table width="100%" class="fs9 border-collapse tbody" style="margin-top: 15px;" cellpadding="3">
            <tbody>
                <tr>
                    <td colspan="1" align="center"><b>Código</b></td>
                    <td colspan="1" align="center"><b>Descripción</b></td>
                    <td colspan="1" align="center"><b>Cant. Entregada</b></td>
                    <td colspan="1" align="center"><b>UND</b></td>
                </tr>
                <#list params.workorder_data.dataDetalleOrdenTrabajo as detordtra>
                <tr>
                    <td colspan="1" <#if detordtra.principio_activo = true>style="background-color: #D6DBDF; color: #000000"</#if>>${detordtra.articulo.codigo}</td>
                    <td colspan="1" <#if detordtra.principio_activo = true>style="background-color: #D6DBDF; color: #000000"</#if>>${detordtra.articulo.descripcion}</td>
                    <td colspan="1" align="center" <#if detordtra.principio_activo = true>style="background-color: #D6DBDF; color: #000000"</#if>>${detordtra.cantidad_entregada?string("#,##0.000")}</td> <!-- ?string("#,##0.000") -->
                    <td colspan="1" align="center" <#if detordtra.principio_activo = true>style="background-color: #D6DBDF; color: #000000"</#if>>${detordtra.unitabbreviation}</td>
                </tr>
                </#list>
            </tbody>
        </table>

        <!-- ORDEN DE TRABAJO -->
        <table width="100%" class="fs9 border-collapse tbody" style="margin-top: 10px;" cellpadding="3">
            <tbody>
                <tr>
                    <td colspan="3" align="left" style="border: none;"><b>Revisión y descarga de OT</b></td>
                </tr>
                <tr>
                    <td colspan="1" align="center"><b>Emitido por</b></td>
                    <td colspan="1" align="center"><b>Revisado por</b></td>
                    <td colspan="1" align="center"><b>Aprobado por</b></td>
                    <td colspan="1" align="center"><b>Recibido por</b></td>
                </tr>
                <tr>
                    <td colspan="1" align="center" valign="middle" style="height: 60px;">
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.workorder_data.emitido_por__id}</b></p>
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.workorder_data.fecha_firma_emitido__id}</b></p>
                    </td>
                    <td colspan="1" align="center" valign="middle" style="height: 60px;">
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.workorder_data.revisado_por__id}</b></p>
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.workorder_data.fecha_firma_revisado__id}</b></p>
                    </td>
                    <td colspan="1" align="center" valign="middle" style="height: 60px;">
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.workorder_data.aprobado_por__id}</b></p>
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.workorder_data.fecha_firma_aprobado__id}</b></p>
                    </td>
                    <td colspan="1" align="center" valign="middle" style="height: 60px;">
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.workorder_data.recibido_por__id}</b></p>
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.workorder_data.fecha_firma_recibido__id}</b></p>
                    </td>
                </tr>
                <tr>
                    <td colspan="1" align="center"><b>Desarrollo Farmacéutico</b></td>
                    <td colspan="1" align="center"><b>Desarrollo Farmacéutico</b></td>
                    <td colspan="1" align="center"><b>Logística</b></td>
                    <td colspan="1" align="center"><b>Almacén</b></td>
                </tr>
                <tr>
                    <td colspan="3" style="border: none;"></td>
                </tr>
                <tr>
                    <td colspan="3" align="left" style="border: none;"><b>Observaciones</b></td>
                </tr>
                <tr>
                    <td colspan="3" align="left" style="border: none;">${params.workorder_data.observaciones}</td>
                </tr>
            </tbody>
        </table>

    </body>
</pdf>