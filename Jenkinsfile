pipeline {
    agent any

    environment {
        PROJECT_DIR = '.'
        NETWORK_NAME = 'network_experiencesig'
    }

    stages {

        // ===============================
        // 1️⃣ CHECKOUT
        // ===============================
        stage('Checkout código fuente') {
            steps {
                echo "📥 Clonando repositorio Experience-portal..."
                checkout scm
                sh 'ls -R Devops || true'
            }
        }

        // ===============================
        // 2️⃣ DETECTAR ENTORNO
        // ===============================
        stage('Detectar entorno') {
            steps {
                script {
                    switch (env.BRANCH_NAME) {
                        case 'main':     env.ENVIRONMENT = 'prod'; break
                        case 'staging':  env.ENVIRONMENT = 'staging'; break
                        case 'qa':       env.ENVIRONMENT = 'qa'; break
                        default:         env.ENVIRONMENT = 'develop'; break
                    }

                    def globalEnvFile = "${env.PROJECT_DIR}/.env"
                    if (fileExists(globalEnvFile)) {
                        echo "📄 Detectado archivo .env global en ${globalEnvFile}"
                        def forcedEnv = sh(script: "grep '^ENVIRONMENT=' ${globalEnvFile} | cut -d '=' -f2", returnStdout: true).trim()
                        if (forcedEnv) {
                            env.ENVIRONMENT = forcedEnv
                            echo "⚙️ Entorno forzado desde .env global: ${env.ENVIRONMENT}"
                        }
                    }

                    env.ENV_DIR = "Devops/${env.ENVIRONMENT}"
                    env.COMPOSE_FILE = "${env.ENV_DIR}/Docker-compose.yml"
                    env.ENV_FILE = "${env.ENV_DIR}/.env.${env.ENVIRONMENT}"

                    echo """
                     Rama detectada: ${env.BRANCH_NAME}
                    🌎 Entorno asignado: ${env.ENVIRONMENT}
                    📄 Compose file: ${env.COMPOSE_FILE}
                    📁 Env file: ${env.ENV_FILE}
                    """
                }
            }
        }

        // ===============================
        // 3️⃣ VERIFICAR RED DOCKER
        // ===============================
        stage('Verificar red Docker') {
            steps {
                sh '''
                    if ! docker network inspect ${NETWORK_NAME} >/dev/null 2>&1; then
                        echo "⚙️ Creando red ${NETWORK_NAME}..."
                        docker network create ${NETWORK_NAME}
                    else
                        echo " Red ${NETWORK_NAME} ya existente."
                    fi
                '''
            }
        }

        // ===============================
        // 4️⃣ CONSTRUIR IMAGEN DOCKER
        // ===============================
        stage('Construir imagen Docker') {
            steps {
                sh """
                    echo '🐳 Construyendo imagen Docker del Front (${ENVIRONMENT})...'
                    docker build -t experience-front-${ENVIRONMENT}:latest .
                """
            }
        }

        // ===============================
        // 5️⃣ DESPLEGAR CON DOCKER COMPOSE
        // ===============================
        stage('Desplegar experience Front') {
            steps {
                dir(env.PROJECT_DIR) {
                    sh """
                        echo '🚀 Desplegando entorno Frontend: ${ENVIRONMENT}'
                        docker compose -f ${COMPOSE_FILE} --env-file ${ENV_FILE} up -d --build
                    """
                }
            }
        }
    }

    // ===============================
    // 🎯 POST ACTIONS
    // ===============================
    post {
        success {
            echo " Despliegue exitoso: Experience Front (${env.ENVIRONMENT})"
        }
        failure {
            echo "💥 Error en el despliegue del Frontend (${env.ENVIRONMENT})"
        }
        always {
            echo "🧹 Pipeline finalizado para entorno: ${env.ENVIRONMENT}"
        }
    }
}

