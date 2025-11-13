

chrome.action.onClicked.addListener(async (tab) => {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        class QueryBase {
          constructor(operationName) {
            this.operationName = operationName;
          }

          operation(query, variables = {}) {
            return {
              "operationName": this.operationName,
              "variables": variables,
              "query": query
            };
          }
        }

        class API {
          constructor(token) {
            this.graphqlURL = "https://graphql.ampli.com.br/";
            this.token = `Bearer ${token}`;
            this.headers = {
              "authorization": this.token,
              "content-type": "application/json",
            };
          }

          async post(body,no_pre) {
            const response = await fetch(this.graphqlURL, {
              "headers": this.headers,
              "body": JSON.stringify(body),
              "method": "POST",
            });
            let data_ql= await response.json()
            
            if (no_pre){
              return data_ql.data
            }

            return data_ql.data.data
          }

          async getMe() {
            let base = new QueryBase("sofiaGetMe");
            let query = "query sofiaGetMe {\n  data: sofiaGetMe {\n    grantedAuthorities\n    email\n    username\n    fullName\n    socialName\n    id\n    personId\n    forcePasswordReset\n    phoneNumber {\n      countryCode\n      areaCode\n      number\n      __typename\n    }\n    __typename\n  }\n}\n";
            let data = await this.post(base.operation(query));
            return data;
          }

          async findCourse(studentId) {
            let base = new QueryBase("FindStudentCourseEnrollmentsForMyCoursePage");
            let variables = { "studentId": studentId };
            let query = "query FindStudentCourseEnrollmentsForMyCoursePage($studentId: ID!) {\n  data: findStudentCourseEnrollments(studentId: $studentId) {\n    id\n    status\n    roles\n    tracks {\n      key\n      value\n      __typename\n    }\n    course {\n      id\n      name\n      versionId\n      courseType {\n        code\n        degree\n        __typename\n      }\n      __typename\n    }\n    progress {\n      totalCourseNumber\n      passedCourseNumber\n      __typename\n    }\n    __typename\n  }\n}\n";
            let data = await this.post(base.operation(query, variables));
            return data;
          }

          async createContentInteraction(learningUnitEnrollmentId, sectionId, learningObjectId) {
            let base = new QueryBase("CreateContentInteraction");
            let now = new Date();
            let variables = {
              "data": {
                "learningUnitEnrollmentId": learningUnitEnrollmentId,
                "sectionId": sectionId,
                "learningObjectId": learningObjectId,
                "action": "FIRST_CONTENT_ACCESS",
                "startActionDateTime": now.toISOString(),
                "originDevice": "WEB"
              }
            };
            let query = "mutation CreateContentInteraction($data: ContentInteractionDto!) {\n  data: createContentInteraction(data: $data)\n}\n";
            let data = await this.post(base.operation(query, variables),true);
            return data;
          }

          async createManyAttendances(subjectEnrollmentId, learningUnitId, sectionId, learningObjectId) {
            let base = new QueryBase("CreateManyAttendances");
            let now = new Date();
            let variables = {
              "data": [{
                "subjectEnrollmentId": subjectEnrollmentId,
                "learningUnitId": learningUnitId,
                "sectionId": sectionId,
                "learningObjectId": learningObjectId,
                "id": crypto.randomUUID(),
                "completionTime": now.toISOString()
              }]
            };
            let query = "mutation CreateManyAttendances($data: [CreateAttendanceInput!]!) {\n  data: createManyAttendances(data: $data)\n}\n";
            let data = await this.post(base.operation(query, variables),true);
            return data;
          }

          async addProgress(externalId, objectId) {
            let base = new QueryBase("AddProgress");
            let now = new Date();
            const formatted = now.toISOString().split('T')[0];
            let variables = {
              "data": [{
                "ra": externalId,
                "objectId": objectId,
                "date": formatted
              }]
            };
            let query = "mutation AddProgress($data: [AddProgressInput!]) {\n  addProgress(data: $data) {\n    status\n    target\n    progress\n    __typename\n  }\n}\n";
            let data = await this.post(base.operation(query, variables),true);
            return data;
          }

          async findLearningUnit(subjectEnrollmentId) {
            let base = new QueryBase("FindLearningUnitEnrollments");
            let variables = { "subjectEnrollmentId": subjectEnrollmentId };
            let query = "query FindLearningUnitEnrollments($subjectEnrollmentId: ID!) {\n  data: findLearningUnitEnrollments(subjectEnrollmentId: $subjectEnrollmentId) {\n    id\n    startDate\n    endDate\n    learningUnitId\n    tempLearningUnitId\n    title\n    status\n    goals\n    order\n    learningUnitVersionId\n    practicalActivities {\n      ... on OnlinePracticalActivity {\n        id\n        title\n        orderOrInfoLastUpdate\n        __typename\n      }\n      ... on PresentialPracticalActivity {\n        id\n        title\n        orderOrInfoLastUpdate\n        scheduling {\n          date\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    sections {\n      id\n      title\n      order\n      learningObjects {\n        id\n        completed\n        __typename\n      }\n      __typename\n    }\n    assignments {\n      grade\n      maxGrade\n      detail {\n        assignmentId: id\n        grade\n        dueDate\n        startDate\n        highestGradeAttemptId\n        config {\n          name\n          description\n          minimumProgressToClose\n          numberOfAttempts\n          reference\n          type\n          __typename\n        }\n        attempts {\n          assignmentAttempId: id\n          grade\n          attemptDate\n          referenceId\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    cases {\n      id\n      name\n      order\n      documentTemplate\n      __typename\n    }\n    __typename\n  }\n}\n";
            let data = await this.post(base.operation(query, variables));
            return data;
          }

          async getCourse(courseEnrollmentId) {
            let base = new QueryBase("GetCourseEnrollmentForPages");
            let variables = { "courseEnrollmentId": courseEnrollmentId };
            let query = `query GetCourseEnrollmentForPages($courseEnrollmentId: ID!) {\n  data: getCourseEnrollment(courseEnrollmentId: $courseEnrollmentId) {\n    id\n    status\n    startDate\n    estimatedEndDate\n    studentId\n    erpIntegration\n    freeTrialStatus\n    externalId\n    classShift\n    gradingPeriodSequence\n    modality\n    subModality\n    roles\n    affiliateId\n    brand\n    lives {\n      id\n      title\n      description\n      startDateTime\n      endDateTime\n      channelId\n      eventId\n      thumbnail\n      mediaId\n      teacherName\n      status\n      __typename\n    }\n    subjectsProgress {\n      conclusionPercentage\n      passedCourseNumber\n      totalCourseNumber\n      __typename\n    }\n    workloadProgress {\n      conclusionPercentage\n      passedWorkloadNumber\n      totalWorkloadNumber\n      __typename\n    }\n    tracks {\n      key\n      value\n      __typename\n    }\n    course {\n      id\n      name\n      workload\n      courseStructureDocument\n      versionId\n      complementaryWorkload\n      courseType {\n        code\n        degree\n        name\n        __typename\n      }\n      __typename\n    }\n    presentialClass {\n      address {\n        city {\n          name\n          __typename\n        }\n        postalCode\n        street\n        number\n        neighbourhood\n        state {\n          name\n          acronym\n          __typename\n        }\n        __typename\n      }\n      classShift\n      presentialClassWeekDays\n      __typename\n    }\n    subjectEnrollments: subjects(full: true) {\n      ...subjectEnrollmentFragmentHomePage\n      lives(statuses: [RECORDED]) {\n        channelId\n        description\n        endDateTime\n        eventId\n        id\n        startDateTime\n        teacherName\n        title\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment subjectEnrollmentFragmentHomePage on SubjectEnrollment {\n  closingDate\n  electiveType\n  endDate\n  endDateForChoice\n  finalGrade\n  id\n  isElective\n  startDate\n  startDateForChoice\n  status\n  subject {\n    id\n    name\n    introduction\n    methodologicalProposal\n    bibliography\n    goals {\n      id\n      name\n      description\n      order\n      __typename\n    }\n    image {\n      id\n      baseUrl\n      formats\n      descriptionText\n      __typename\n    }\n    simulators {\n      code\n      __typename\n    }\n    __typename\n  }\n  gradingMethod {\n    id\n    cutOffScore\n    assignmentConfigs {\n      id\n      name\n      type\n      reference\n      weight\n      durationInMinutes\n      minimumProgressToClose\n      hasRecovery\n      durationInMinutesRecovery\n      numberOfQuestionsRecovery\n      weightRecovery\n      __typename\n    }\n    __typename\n  }\n  assignments {\n    id\n    status\n    detail {\n      id\n      startDate\n      dueDate\n      highestGradeAttemptId\n      assignmentFiles {\n        feedback\n        __typename\n      }\n      specialization {\n        id\n        assignmentId\n        ... on SpecializationQuestionList {\n          id\n          assignmentId\n          currentFlow\n          substituteAssignmentId\n          __typename\n        }\n        ... on SpecializationSchoolWork {\n          id\n          assignmentId\n          lessonPlanId\n          __typename\n        }\n        __typename\n      }\n      display {\n        name\n        periodTitle\n        periodDates\n        __typename\n      }\n      config {\n        id\n        name\n        type\n        numberOfAttempts\n        hasRecovery\n        typeConfig {\n          id\n          modelType\n          modelSubType\n          url\n          presignedUrl\n          __typename\n        }\n        __typename\n      }\n      attempts {\n        id\n        grade\n        referenceId\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  progress {\n    completed\n    quantity\n    engagementPercentage\n    details {\n      type\n      completed\n      quantity\n      __typename\n    }\n    __typename\n  }\n  courseSubject {\n    subType\n    __typename\n  }\n  mandatoryInternship {\n    id\n    status\n    assignmentStatus\n    consolidatedStatus\n    rejectionReason\n    __typename\n  }\n  choices {\n    id\n    __typename\n  }\n  learningUnits {\n    id\n    __typename\n  }\n  __typename\n}\n`;
            let data = await this.post(base.operation(query, variables));
            return data;
          }
        }

        async function getTokenFromIndexedDB() {
          const req = indexedDB.open("hipotenusa");
          
          return new Promise((resolve, reject) => {
            req.onerror = () => {
              console.error("Erro ao abrir banco de dados:", req.error);
              reject(req.error);
            };

            req.onsuccess = (event) => {
              const db = event.target.result;
              
              try {
                const tx = db.transaction("student-auth", "readonly");
                const store = tx.objectStore("student-auth");
                const getRequest = store.get("token");
                
                getRequest.onsuccess = () => {
                  let tokenValue = getRequest.result;
                  console.log("Resultado da busca por 'token':", tokenValue);
                  
                  if (typeof tokenValue === "string") {
                    console.log("Token encontrado (string):", tokenValue);
                    db.close();
                    resolve(tokenValue);
                  } else if (tokenValue && typeof tokenValue === "object" && tokenValue.token) {
                    console.log("Token encontrado (objeto):", tokenValue.token);
                    db.close();
                    resolve(tokenValue.token);
                  } else if (tokenValue === undefined) {
                    // Se não encontrou pela chave, buscar todos os registros
                    console.log("Chave 'token' não encontrada, buscando todos os registros...");
                    const getAllRequest = store.getAll();
                    
                    getAllRequest.onsuccess = () => {
                      const allRecords = getAllRequest.result;
                      console.log("Todos os registros:", allRecords);
                      
                      let foundToken = null;
                      for (const record of allRecords) {
                        if (typeof record === "string" && record.length > 30) {
                          foundToken = record;
                          break;
                        } else if (record && typeof record === "object") {
                          if (record.token) {
                            foundToken = record.token;
                            break;
                          } else if (record.value) {
                            foundToken = record.value;
                            break;
                          }
                        }
                      }
                      
                      if (foundToken) {
                        console.log("Token encontrado nos registros:", foundToken);
                        db.close();
                        resolve(foundToken);
                      } else {
                        console.error("Token não encontrado em nenhum registro");
                        db.close();
                        resolve(null);
                      }
                    };
                    
                    getAllRequest.onerror = () => {
                      console.error("Erro ao buscar todos os registros:", getAllRequest.error);
                      db.close();
                      reject(getAllRequest.error);
                    };
                  } else {
                    console.log("Token encontrado mas formato inesperado:", tokenValue);
                    db.close();
                    resolve(tokenValue);
                  }
                };
                
                getRequest.onerror = () => {
                  console.error("Erro ao buscar token:", getRequest.error);
                  db.close();
                  reject(getRequest.error);
                };
                
                tx.onerror = () => {
                  console.error("Erro na transação:", tx.error);
                  db.close();
                  reject(tx.error);
                };
              } catch (error) {
                console.error("Erro ao acessar object store:", error);
                db.close();
                reject(error);
              }
            };
          });
        }

        const token = await getTokenFromIndexedDB();
        
        if (token) {

          const api = new API(token);
          const me = await api.getMe();
          
          const dataCourse = await api.findCourse(me.personId)

          const infoCourse = await api.getCourse(dataCourse[0].id)
          const enrollments = infoCourse.subjectEnrollments
          const externalId=infoCourse.externalId

          enrollments.forEach(async subject=>{
            console.log(`Disciplina: ${subject.subject.name}`)

            const subjectEnrollmentId= subject.id
            const learnings = await api.findLearningUnit(subjectEnrollmentId)

            learnings.forEach(async learning=>{
              console.log(`Titulo da unidade: ${learning.title}`)
              const learningUnitId =learning.id
              learning.sections.forEach(async section=>{
                console.log(`Titulo da sessão: ${section.title}`)
                section.learningObjects.forEach(async learningOBJ=>{
                  if (learningOBJ.completed!==true){

                    let response_create = await api.createContentInteraction(
                        learning.id,
                        section.id,
                        learningOBJ.id
                      )

                    console.log(`Create Content: ${response_create}`)

                    let response_many = await api.createManyAttendances(
                        subjectEnrollmentId,
                        learningUnitId,
                        section.id,
                        learningOBJ.id,
                      )

                    console.log(`Create Many: ${response_many}`)

                    let response_progress = await api.addProgress(
                        externalId,
                        learningOBJ.id,
                      )

                    console.log(`AddProgress: ${response_progress}`)



                  }
                })

                })
                

              })

          })

          alert("Pronto agora você pode ficar tranquilo, todas aulas foram 100% concluidas, agora as atividades é com você!")

        } else {
          console.error("Token não encontrado");
        }
      }
    });
  });
  

  