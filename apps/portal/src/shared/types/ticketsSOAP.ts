/** @format */

export interface TicketsUserSOAP {
  Ref: string;
  ФИО: string;
  Аватар: string;
  ОсновнойEmail: string;
  ОсновнойТелефон: string;
  Организация: string;
  Подразделение: string;
  РуководительНаименование: string;
  Должность: string;
}

export interface TicketsUsersSOAP {
  Пользователь?: TicketsUserSOAP[];
}

export interface TicketsServiceSOAP {
  Код: string;
  Наименование: string;
  Описание: string;
  СервисВладелец?: string;
  Аватар: string;
}

export interface TicketsServicesSOAP {
  Услуга: TicketsServiceSOAP[];
}

export interface TicketsRouteSOAP {
  Код: string;
  Наименование: string;
  Описание: string;
  Аватар: string;
  СписокУслуг?: TicketsServicesSOAP;
}

export interface TicketsSOAPGetRoutes {
  Сервис?: TicketsRouteSOAP[];
}

export interface TicketsFileSOAP {
  Ref: string;
  Наименование?: string;
  РасширениеФайла?: string;
  MIME?: string;
  ФайлХранилище?: string;
}

export interface TicketsFilesSOAP {
  Файл: TicketsFileSOAP[];
}

export interface TicketsCommentSOAP {
  Дата: Date;
  // Ref
  Автор: string;
  Текст: string;
  Код: string;
  КодРодителя: string;
  Файлы: TicketsFilesSOAP;
}

export interface TicketsCommentsSOAP {
  Комментарий: TicketsCommentSOAP[];
}

export interface TicketsTaskSOAP {
  Ref: string;
  Код: string;
  Наименование: string;
  Описание?: string;
  Статус: string;
  Дата?: Date;
  СрокИсполнения?: Date;
  ДатаЗавершения?: Date;
  ТекущийИсполнитель: string;
  Инициатор: string;
  Сервис: TicketsRouteSOAP;
  Услуга: TicketsServiceSOAP;
  ДоступноеДействие?: string;
  ДоступныеЭтапы?: string;
  Файлы?: TicketsFilesSOAP;
  Комментарии?: TicketsCommentsSOAP;
}

export interface TicketsTasksSOAP {
  Задание?: TicketsTaskSOAP[];
}

export interface TicketsSOAPGetTasks {
  Пользователи?: TicketsUsersSOAP;
  Задания?: TicketsTasksSOAP;
}

export interface TicketsSOAPGetTaskDescription {
  Пользователи?: TicketsUsersSOAP;
  Задания?: TicketsTasksSOAP;
}
