import main from './main';
import axios from 'axios';
import Swal from 'sweetalert2';


/* cuando se cargue el dom */
document.addEventListener('DOMContentLoaded', (e) => {

    externalLinks();

    /* clear alerts */
    const alerts = document.querySelector('#alerts');

    if (alerts) {
        clearAlerts();
    }

    /* skills */
    const skills = document.querySelector('.lista-conocimientos');
    if (skills) {
        skills.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                if (e.target.classList.contains('activo')) {
                    setSkills.delete(e.target.textContent);
                    e.target.classList.remove('activo')
                } else {
                    setSkills.add(e.target.textContent);
                    e.target.classList.add('activo');
                }
            }

            const skillsArray = [...setSkills];
            document.querySelector('#skills').value = skillsArray;
        });

        /* una vez que estamos en editar */
        selectedSkills();
    }


    const divDescription = document.querySelector('#description');
    if (divDescription) {
        /* console.log({divDescription});
        let arreglo = Array.from(divDescription.children);
        console.log({arreglo});
        arreglo.forEach((element) => {
            if (element.localName === "ul") {
                const ulNode = element;
                if (ulNode) {
                    ulNode.classList.add('list-group');
                    const liArray = Object.values(ulNode.children);
                    liArray.forEach((li) => {
                        li.classList.add('list-group-item');
                        li.classList.add('list-group-item-primary');
                    });
                }
            }
        }) */
    }

    /* validate forms: class 'needs-validation' */
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function (form) {
        form.addEventListener('submit', function (event) {
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });


    /* delete jobs */
    const jobList = document.querySelector('.table-active');

    if (jobList) {
        jobList.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.dataset.delete) {

                const url = `${location.origin}/jobs/delete/${e.target.dataset.delete}`;

                // eliminar con axios
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: "Una vacante elminada no se puede recuperrar",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Si, eliminar!',
                    cancelButtonText: 'No, Cancelar!',
                    animation: false,
                    customClass: {
                        popup: 'animated tada'
                    }
                }).then((result) => {
                    if (result.value) {
                        /* axios para eliminar */
                        axios.delete(url, { params: { url } })
                            .then((result) => {
                                if (result.status === 200) {
                                    Swal.fire(
                                        'Vacante Eliminada',
                                        result.data,
                                        'success'
                                    );
                                    /* eliminar vacante del dom */
                                    e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                                }
                            }).catch((err) => {
                                console.log(err);
                                Swal.fire(
                                    'Hubo un error',
                                    'No se pudo eliminar la vacante',
                                    'error'
                                );
                            });
                    }
                })
            } else if (e.target.tagName === 'A') {
                window.location.href = e.target.href;
            }
        });
    }


    /* show filename in input file tag */
    const customFile = document.querySelector('#customFileLang');
    if (customFile) {
        customFile.addEventListener('change', (e) => {
            const labelName = document.querySelector('.custom-file-label');
            labelName.textContent = customFile.files[0].name;
        })
    }

});

const setSkills = new Set();

const selectedSkills = () => {
    /* convertir nodeList a un arreglo */
    const selected = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    selected.forEach((li) => {
        setSkills.add(li.textContent);
    });

    /* inyectarlo al input hidden */
    const skillsArray = [...setSkills];
    document.querySelector('#skills').value = skillsArray;
}

const clearAlerts = () => {
    const alerts = document.querySelector('#alerts');
    const interval = setInterval(() => {
        if (alerts.children.length > 0) {
            alerts.children[0].classList.add('animated', 'fadeOutUp');
            setTimeout(() => {
                alerts.removeChild(alerts.children[0]);
            }, 1000);
        } else if (alerts.children.length === 0) {
            alerts.parentElement.removeChild(alerts);
            clearInterval(interval);
        }
    }, 2000);
}

function externalLinks() { if (!document.getElementsByTagName) return; var anchors = document.getElementsByTagName("a"); for (var i = 0; i < anchors.length; i++) { var anchor = anchors[i]; if (anchor.getAttribute("href") && anchor.getAttribute("rel") == "external") anchor.target = "_blank"; } }