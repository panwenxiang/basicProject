pipeline {
    agent any

    tools {
        maven "M3"
    }

    stages {
        stage('Build App') {
            when {
                branch "master"
            }
            steps {
                git branch: 'master', credentialsId: 'jenkins', url: 'https://git02.bohan-it.com:3000/RD/kms-web.git'
                sh "npm install"
                sh "npm run build"
            }
            post {
                success {
                    sh "echo 'kms-web-v2 is built successfully'"
                }
            }
        }
        stage('Build Docker Img') {
            when {
                branch "master"
            }
            steps {
                sh "docker login -u cn-east-3@YM2DRCBFV5D26IO2LYZW -p 03f01db5246699e608e03f6037e85521f47100e9e1dfd9da2c1b7a4189dcc6f1 swr.cn-east-3.myhuaweicloud.com"
                sh "docker build -t swr.cn-east-3.myhuaweicloud.com/dfemall/kms-web-v2:1.0.${BUILD_NUMBER} ."
                sh "docker push swr.cn-east-3.myhuaweicloud.com/dfemall/kms-web-v2:1.0.${BUILD_NUMBER}"
                sh "docker tag swr.cn-east-3.myhuaweicloud.com/dfemall/kms-web-v2:1.0.${BUILD_NUMBER} swr.cn-east-3.myhuaweicloud.com/dfemall/kms-web-v2:latest"
                sh "docker push swr.cn-east-3.myhuaweicloud.com/dfemall/kms-web-v2:latest"
                sh "docker service update --image=swr.cn-east-3.myhuaweicloud.com/dfemall/kms-web-v2:1.0.${BUILD_NUMBER} kms-web-v2"
            }
            post {
                success {
                    script{
                        def params = assembly_params()
                        sh "webhook-client ${params} -w https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=66967ec8-de77-4456-bb43-3ed3439adc76 -s"
                    }
                }
                failure {
                    script{
                        def params = assembly_params()
                        sh "webhook-client ${params} -w https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=66967ec8-de77-4456-bb43-3ed3439adc76"
                    }
                }
            }
        }
    }
}

def assembly_params() {
    def commit_message = "${sh(returnStdout: true, script: 'git log -1 --pretty=%B | cat')}"
    commit_message = commit_message.trim().replaceAll(" ", "%20")
    commit_message = commit_message.trim().replaceAll("\n", "%5Cn")

    def notify_param = "";
    notify_param += "--git-url ${GIT_URL}"
    notify_param += " --build-number ${BUILD_NUMBER}"
    notify_param += " --job-name ${JOB_NAME}"
    notify_param += " --msg ${commit_message}"

    //调用方法得到日志 并 输出
    def changeString = getChangeString()
    notify_param += changeString
    return notify_param
}

@NonCPS
def getChangeString() {
    def changeString = ""
    def commit_id = ""
    def author = ""
    def files = []
    def changeLogSets = currentBuild.changeSets
    for (int i = 0; i < changeLogSets.size(); i++) {
        def entries = changeLogSets[i].items
        for (int j = 0; j < entries.length; j++) {
            def entry = entries[j]
            def affectedFiles = entry.affectedFiles
            for (int k = 0; k < affectedFiles.size(); k++) {
                def local_file = " --affected-file " + affectedFiles[k].path;
                if (!files.contains(local_file)) {
                    files.add(local_file);
                }
            }
            commit_id = " --commit-id " + entry.commitId;
            author = " --author " + entry.author.fullName;
        }
    }
    changeString += commit_id;
    changeString += author;
    for (int i = 0; i < files.size(); i++) {
        changeString += files[i];
    }
    return changeString
}
