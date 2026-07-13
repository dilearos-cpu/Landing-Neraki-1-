<?php
/**
 * Datos estáticos: ciudades, nombres y tiempos.
 *
 * @package DiegoArangoSocialProof
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase DASP_Data
 */
class DASP_Data {

	/**
	 * Principales ciudades de Colombia.
	 *
	 * @return string[]
	 */
	public static function get_cities() {
		return array(
			'Bogotá',
			'Medellín',
			'Cali',
			'Barranquilla',
			'Cartagena',
			'Bucaramanga',
			'Pereira',
			'Manizales',
			'Santa Marta',
			'Ibagué',
			'Cúcuta',
			'Villavicencio',
			'Pasto',
			'Montería',
			'Valledupar',
			'Neiva',
			'Armenia',
			'Sincelejo',
			'Popayán',
			'Tunja',
		);
	}

	/**
	 * Nombres aleatorios para las notificaciones.
	 *
	 * @return string[]
	 */
	public static function get_names() {
		return array(
			'Juanito',
			'María',
			'Carlos',
			'Ana',
			'Pedro',
			'Laura',
			'Diego',
			'Camila',
			'Andrés',
			'Valentina',
			'Santiago',
			'Daniela',
			'Felipe',
			'Isabella',
			'Mateo',
			'Sofía',
			'Sebastián',
			'Lucía',
			'Nicolás',
			'Paula',
			'Julián',
			'Mariana',
			'Alejandro',
			'Carolina',
			'David',
			'Natalia',
		);
	}

	/**
	 * Frases de tiempo relativas.
	 *
	 * @return string[]
	 */
	public static function get_time_phrases() {
		return array(
			'unos segundos',
			'1 minuto',
			'2 minutos',
			'3 minutos',
			'5 minutos',
			'8 minutos',
			'12 minutos',
			'15 minutos',
		);
	}

	/**
	 * Posiciones disponibles del popup.
	 *
	 * @return array<string, string>
	 */
	public static function get_positions() {
		return array(
			'bottom-left'  => __( 'Abajo izquierda', 'diego-arango-social-proof' ),
			'bottom-right' => __( 'Abajo derecha', 'diego-arango-social-proof' ),
			'top-left'     => __( 'Arriba izquierda', 'diego-arango-social-proof' ),
			'top-right'    => __( 'Arriba derecha', 'diego-arango-social-proof' ),
		);
	}
}
