function Selector(elm)
                {
                    console.log(elm.value)  
                    document.getElementById("seleccionado").innerHTML=elm.value
                }function cantidad(elm)
                {
                    console.log(elm.value)  
                }
                    $(document).ready(function() {   
                        var url = 'http://localhost:3030/tablaHoras2';
                        $('#tablaDatos').DataTable({            
                            "ajax":{
                                "url": url,
                                "dataSrc":""
                            }, "order": [[0, "desc"]],
                            "columns":[
                                {"data":"fecha"},
                                {"data":"hora_inicio"},
                                {"data":"hora_fin"},
                                {"data":"horas"},
                                {"data":"detalle"},
                                {"data":"consultor"}
                            ],
                            'columnDefs': [{
                                'targets': 6,
                                'checkboxes': {
                                'selectRow': true
                                }
                            }
                        ]
                        });
                    });