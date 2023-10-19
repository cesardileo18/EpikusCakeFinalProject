const socket = io();

const chatBox = document.getElementById("input-msg");
let emailIngresado = "";

async function main() {
	const { value: email } = await Swal.fire({
		title: "Enter your email",
		input: "text",
		inputLabel: "Your email",
		inputValue: "",
		showCancelButton: true, // Mostrar un botón de cancelar
		cancelButtonText: "Atrás", // Texto para el botón de cancelar
		allowOutsideClick: false,
		inputValidator: value => {
			if (!value) {
				return "You need to write something!";
			}
		},
		
	});

	emailIngresado = email;
	if (!email) {
		// El usuario hizo clic en el botón "Atrás" o cerró la ventana modal
		window.location.href = "/home";
	}
}

main();

chatBox.addEventListener("keyup", ({ key }) => {
	if (key == "Enter") {
		socket.emit("msg_front_to_back", {
			message: chatBox.value,
			user: emailIngresado,
		});
		chatBox.value = "";
	}
});

socket.on("listado_de_msgs", msgs => {
	const divMsgs = document.getElementById("div-msgs");
	let formato = "";
	msgs.forEach(msg => {
		formato =
			formato +
			`<div class="mt-3"><p><span class="fw-bold">User: </span>` +
			msg.user +
			`</br>` +
			`</p>` +
			`<p><span class="fw-bold">Message: </span>` +
			msg.message +
			`</p></div>`;
	});
	divMsgs.innerHTML = formato;
});
